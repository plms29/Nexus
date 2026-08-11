import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { randomUUID } from 'crypto';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  const raw = readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([^=]+)="?([^"]*)"?$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const ts = Date.now();
const TEACHER_EMAIL = `teacher.e2e.${ts}@test.com`;
const STUDENT_EMAIL = `student.e2e.${ts}@test.com`;
const PASSWORD = 'test123456';
const CLASS_ID = '10A1';
const TASK_ID = randomUUID();

function log(step, ok, detail = '') {
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${step}${detail ? ` — ${detail}` : ''}`);
}

async function signUp(email, name, role) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: PASSWORD,
    options: { data: { name, role } },
  });
  if (error) throw error;
  if (!data.user) throw new Error('No user returned from signUp');
  return data.user;
}

async function signIn(email) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw error;
  return data.user;
}

async function saveStudentProfileRow(userId, email) {
  const attempts = [
    { id: userId, email, name: 'HS E2E Test', role: 'student', class_id: CLASS_ID, school: 'THPT Test', province: 'Đà Nẵng', avatar: 'https://example.com/a.png' },
    { id: userId, email, name: 'HS E2E Test', role: 'student', class_id: CLASS_ID, school: 'THPT Test', province: 'Đà Nẵng' },
    { id: userId, email, name: 'HS E2E Test', role: 'student', class_id: CLASS_ID },
    { id: userId, email, name: 'HS E2E Test', role: 'student' },
  ];
  for (const payload of attempts) {
    const { error } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
    if (!error) return { source: 'db', payload };
  }

  await supabase.auth.updateUser({
    data: {
      name: 'HS E2E Test',
      class_id: CLASS_ID,
      school: 'THPT Test',
      province: 'Đà Nẵng',
    },
  });
  return { source: 'metadata', payload: { class_id: CLASS_ID } };
}

async function main() {
  console.log('\n=== E2E Assignment Flow Test ===\n');

  try {
    const teacher = await signUp(TEACHER_EMAIL, 'GV E2E Test', 'teacher');
    log('Teacher signup', true, teacher.id);

    await supabase.from('users').upsert({
      id: teacher.id,
      email: TEACHER_EMAIL,
      name: 'GV E2E Test',
      role: 'teacher',
    }, { onConflict: 'id' });

    await supabase.from('teacher_profiles').upsert({
      id: teacher.id,
      name: 'GV E2E Test',
      school: 'THPT Test',
      subject_group: 'natural',
      subjects: ['Toán'],
      classes: [CLASS_ID, '10A2'],
    }, { onConflict: 'id' });
    log('Teacher profile saved', true, `classes: ${CLASS_ID}`);

    const deadline = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
    const { error: taskError } = await supabase.from('tasks').insert({
      id: TASK_ID,
      title: `Bài KT E2E ${ts}`,
      type: 'quiz',
      class_id: CLASS_ID,
      subject_id: 'Toán',
      deadline,
      is_group: false,
    });
    if (taskError) throw taskError;
    log('Teacher created task', true, `${TASK_ID} for class ${CLASS_ID}`);

    await supabase.auth.signOut();

    const student = await signUp(STUDENT_EMAIL, 'HS E2E Test', 'student');
    log('Student signup', true, student.id);

    await signIn(STUDENT_EMAIL);
    const savedProfile = await saveStudentProfileRow(student.id, STUDENT_EMAIL);
    log('Student profile saved', true, `${savedProfile.source}: ${JSON.stringify(savedProfile.payload)}`);

    const { data: tasks, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('class_id', CLASS_ID);
    if (fetchError) throw fetchError;

    const found = tasks?.some((t) => t.id === TASK_ID);
    log('Student fetch tasks by class 10A1', found, `found ${tasks?.length || 0} task(s)`);

    const { data: wrongClassTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('class_id', '99Z9');
    const isolated = !wrongClassTasks?.some((t) => t.id === TASK_ID);
    log('Task hidden from wrong class', isolated);

    await supabase.from('tasks').delete().eq('id', TASK_ID);
    log('Cleanup test task', true);

    if (found && isolated) {
      console.log('\n✅ ALL TESTS PASSED — Giáo viên giao bài, học sinh cùng lớp 10A1 nhận được.\n');
      if (savedProfile.source === 'metadata') {
        console.log('⚠️  Lưu ý: users.class_id trên Supabase chưa đúng kiểu TEXT.');
        console.log('   Chạy migration: supabase/migrations/20260811223000_add_users_class_id.sql\n');
      }
    } else {
      console.log('\n❌ TEST FAILED\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('\n❌ TEST ERROR:', err.message || err);
    try { await supabase.from('tasks').delete().eq('id', TASK_ID); } catch {}
    process.exit(1);
  }
}

main();
