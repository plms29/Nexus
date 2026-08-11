/**
 * Simulates app-level student profile save + task fetch after teacher assignment.
 * Run: node scripts/test-app-flow.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { randomUUID } from 'crypto';

const env = Object.fromEntries(
  readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^([^=]+)="?([^"]*)"?$/);
      return m ? [m[1], m[2]] : [];
    })
    .filter((x) => x.length === 2)
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const CLASS_ID = '10A1';
const PASSWORD = 'test123456';
const ts = Date.now();
const studentEmail = `app.flow.${ts}@test.com`;
const taskId = randomUUID();

function normalizeClassId(v) {
  return (v || '').trim().toUpperCase();
}

async function saveStudentProfileLikeApp(userId, profile) {
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email;
  const normalizedClassId = normalizeClassId(profile.classId);

  const { error } = await supabase.from('users').upsert({
    id: userId,
    email,
    name: profile.name,
    class_id: normalizedClassId,
    school: profile.school,
    province: profile.province,
    avatar: profile.avatar,
    role: 'student',
  }, { onConflict: 'id' });

  if (error) {
    const isSchemaIssue =
      error.message.includes('schema cache') ||
      error.message.includes('column') ||
      error.message.includes('uuid');

    if (!isSchemaIssue) throw new Error(error.message);

    const fallbacks = [
      { id: userId, email, name: profile.name, role: 'student', school: profile.school, province: profile.province },
      { id: userId, email, name: profile.name, role: 'student' },
    ];
    let saved = false;
    for (const payload of fallbacks) {
      const { error: fallbackError } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
      if (!fallbackError) { saved = true; break; }
    }
    if (!saved) throw new Error(error.message);
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      name: profile.name,
      class_id: normalizedClassId,
      school: profile.school,
      province: profile.province,
      avatar: profile.avatar,
    },
  });
  if (authError) throw new Error(authError.message);
}

async function main() {
  console.log('\n=== App Flow Simulation ===\n');

  await supabase.from('tasks').insert({
    id: taskId,
    title: `Bài GV giao ${ts}`,
    type: 'quiz',
    class_id: CLASS_ID,
    subject_id: 'Toán',
    deadline: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    is_group: false,
  });

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: studentEmail,
    password: PASSWORD,
    options: { data: { name: 'HS App Flow', role: 'student' } },
  });
  if (signUpError) throw signUpError;

  await supabase.auth.signInWithPassword({ email: studentEmail, password: PASSWORD });

  await saveStudentProfileLikeApp(signUpData.user.id, {
    name: 'HS App Flow',
    classId: CLASS_ID,
    school: 'THPT Test',
    province: 'Đà Nẵng',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=App',
  });
  console.log('[PASS] Student saved profile via app logic');

  const { data: { user } } = await supabase.auth.getUser();
  const targetClass = normalizeClassId(user.user_metadata?.class_id);
  console.log('[INFO] Resolved student class:', targetClass);

  const { data: tasks } = await supabase.from('tasks').select('*').eq('class_id', targetClass);
  const found = tasks?.some((t) => t.id === taskId);
  console.log(found ? '[PASS] Student sees teacher task' : '[FAIL] Student cannot see teacher task');

  await supabase.from('tasks').delete().eq('id', taskId);
  process.exit(found ? 0 : 1);
}

main().catch((err) => {
  console.error('[FAIL]', err.message);
  process.exit(1);
});
