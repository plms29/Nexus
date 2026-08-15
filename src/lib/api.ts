import { supabase } from './supabase';
import { AuditLog, Task, WorkmapEntry } from './engine/types';
import { DEFAULT_CLASS_ID, normalizeClassId } from './class-utils';

export interface QuestionItem {
  id?: string;
  task_id?: string | null;
  package_id?: string | null;
  question_text: string;
  options: string[];
  correct_answer: string;
  level: 'l1' | 'l2' | 'l3' | 'l4';
  explanation?: string;
  image_url?: string | null;
}

export const QUESTION_IMAGE_BUCKET = 'question-images';
export const MAX_QUESTION_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

/** Upload ảnh minh họa cho câu hỏi lên Supabase Storage, trả về public URL */
export async function uploadQuestionImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'Chỉ hỗ trợ file ảnh (PNG, JPG, WEBP...).' };
  }
  if (file.size > MAX_QUESTION_IMAGE_BYTES) {
    return { success: false, error: 'Ảnh vượt quá 5MB, vui lòng chọn ảnh nhỏ hơn.' };
  }

  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `questions/${crypto.randomUUID()}.${ext || 'png'}`;

  const { error } = await supabase.storage
    .from(QUESTION_IMAGE_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });

  if (error) return { success: false, error: error.message };

  const { data } = supabase.storage.from(QUESTION_IMAGE_BUCKET).getPublicUrl(path);
  return { success: true, url: data.publicUrl };
}

export interface QuestionPackage {
  id: string;
  title: string;
  subject: string;
  grade_class: string;
  description?: string;
  created_at?: string;
  questions_count?: number;
}

export async function fetchTeacherProfile(userId: string) {
  const { data, error } = await supabase
    .from('teacher_profiles')
    .select('classes, subjects')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.warn('Error fetching teacher profile:', error.message);
    return null;
  }
  return data;
}

export async function fetchStudentProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('name, class_id, school, province, avatar')
      .eq('id', userId)
      .maybeSingle();

    if (data && data.name && data.class_id && data.school && data.province) {
      return {
        name: data.name || '',
        classId: normalizeClassId(data.class_id) || DEFAULT_CLASS_ID,
        school: data.school || 'THPT Chuyên Lê Quý Đôn',
        province: data.province || 'Đà Nẵng',
        avatar: data.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4',
        isOnboarded: true
      };
    }

    const { data: { user } } = await supabase.auth.getUser();
    const metaClassId = normalizeClassId(user?.user_metadata?.class_id);
    if (user?.id === userId && data?.name && metaClassId) {
      return {
        name: data.name,
        classId: metaClassId,
        school: data.school || user.user_metadata?.school || 'THPT Chuyên Lê Quý Đôn',
        province: data.province || user.user_metadata?.province || 'Đà Nẵng',
        avatar: data.avatar || user.user_metadata?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4',
        isOnboarded: true,
      };
    }
  } catch (err) {
    console.warn('Could not fetch student profile from database:', err);
  }
  return null;
}

export async function saveStudentProfile(userId: string, profile: { name: string; classId: string; school: string; province: string; avatar: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email;
  if (!email) throw new Error('Không tìm thấy email tài khoản.');

  const normalizedClassId = normalizeClassId(profile.classId);

  const { error } = await supabase
    .from('users')
    .upsert({
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

    if (isSchemaIssue) {
      const fallbacks: Record<string, string>[] = [
        { id: userId, email, name: profile.name, role: 'student', school: profile.school, province: profile.province },
        { id: userId, email, name: profile.name, role: 'student' },
      ];
      let saved = false;
      for (const payload of fallbacks) {
        const { error: fallbackError } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
        if (!fallbackError) { saved = true; break; }
      }
      if (!saved) throw new Error(error.message);
    } else {
      throw new Error(error.message);
    }
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

export async function fetchTasks(classId?: string) {
  let query = supabase.from('tasks').select('*');
  const normalizedClassId = normalizeClassId(classId);
  if (normalizedClassId) {
    query = query.eq('class_id', normalizedClassId);
  }
  
  const { data, error } = await query;
  if (error) {
    console.warn('Supabase missing table (tasks):', error.message);
    return [];
  }
  
  return data.map((d: any) => ({
    id: d.id,
    title: d.title,
    type: d.type,
    class_id: normalizeClassId(d.class_id),
    subject_id: d.subject_id,
    deadline: d.deadline,
    isGroup: d.is_group,
    topic: d.topic,
    learning_objectives: d.learning_objectives,
    outline: d.outline || [],
    essay_steps: d.essay_steps || [],
    is_outline_approved: d.is_outline_approved || false,
  })) as Task[];
}

export async function fetchWorkmap(classId?: string) {
  const normalizedClassId = normalizeClassId(classId);
  try {
    let query = supabase.from('workmap_entries').select('*, tasks!inner(class_id)');
    if (normalizedClassId) {
      query = query.eq('tasks.class_id', normalizedClassId);
    }

    const { data, error } = await query;
    if (!error && data) {
      return data.map((d: any) => ({
        date: d.date,
        subject_group: d.subject_group,
        minutes: Number(d.minutes),
        lu: Number(d.lu),
        task_id: d.task_id,
        step_name: d.step_name,
      })) as WorkmapEntry[];
    }
  } catch (e) {}

  // Fallback: fetch all workmap entries directly
  const { data, error } = await supabase.from('workmap_entries').select('*');
  if (error || !data) {
    console.warn('Supabase workmap fetch fallback:', error?.message);
    return [];
  }

  return data.map((d: any) => ({
    date: d.date,
    subject_group: d.subject_group,
    minutes: Number(d.minutes),
    lu: Number(d.lu),
    task_id: d.task_id,
    step_name: d.step_name,
  })) as WorkmapEntry[];
}

export async function saveScheduledTask(task: Task, entries: WorkmapEntry[]) {
  const normalizedClassId = normalizeClassId(task.class_id) || DEFAULT_CLASS_ID;
  const insertPayload: any = {
    id: task.id,
    title: task.title,
    type: task.type,
    class_id: normalizedClassId,
    subject_id: task.subject_id,
    deadline: task.deadline,
    is_group: task.isGroup,
    outline: task.outline || [],
    essay_steps: task.essay_steps || [],
    is_outline_approved: task.is_outline_approved || false,
  };

  let taskData: any = null;
  let { data, error: taskError } = await supabase
    .from('tasks')
    .insert(insertPayload)
    .select()
    .single();

  if (taskError) {
    console.warn('Initial task insert warning:', taskError.message);
    // If Supabase schema lacks the new columns (essay_steps/outline/is_outline_approved), retry without them
    if (taskError.message?.includes('column') || taskError.message?.includes('schema cache')) {
      const fallbackPayload = {
        id: task.id,
        title: task.title,
        type: task.type,
        class_id: normalizedClassId,
        subject_id: task.subject_id,
        deadline: task.deadline,
        is_group: task.isGroup,
      };
      const retryRes = await supabase
        .from('tasks')
        .insert(fallbackPayload)
        .select()
        .single();

      taskData = retryRes.data;
      taskError = retryRes.error;
    }
  } else {
    taskData = data;
  }

  if (taskError || !taskData) {
    console.error('Error inserting task:', taskError?.message);
    return { success: false, error: taskError };
  }

  if (entries.length > 0) {
    const entriesToInsert = entries.map(e => ({
      date: e.date,
      subject_group: e.subject_group,
      minutes: e.minutes,
      lu: e.lu,
      task_id: taskData.id,
      step_name: e.step_name,
    }));

    const { error: entriesError } = await supabase
      .from('workmap_entries')
      .insert(entriesToInsert);

    if (entriesError) {
      console.error('Error inserting workmap entries:', entriesError.message);
      return { success: false, error: entriesError };
    }
  }

  return { success: true, task: taskData };
}

export async function updateTaskInDb(taskId: string, updates: Partial<Task>) {
  const payload: any = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.class_id !== undefined) payload.class_id = normalizeClassId(updates.class_id) || DEFAULT_CLASS_ID;
  if (updates.subject_id !== undefined) payload.subject_id = updates.subject_id;
  if (updates.deadline !== undefined) payload.deadline = updates.deadline;
  if (updates.isGroup !== undefined) payload.is_group = updates.isGroup;
  if (updates.type !== undefined) payload.type = updates.type;

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error.message);
    return { success: false, error };
  }
  return { success: true, data };
}

export async function deleteTaskFromDb(taskId: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Error deleting task:', error.message);
    return { success: false, error };
  }
  return { success: true };
}

export async function fetchQuestionsForTask(taskId: string): Promise<QuestionItem[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('task_id', taskId);

  if (error) {
    console.warn('Error fetching questions:', error.message);
    return [];
  }
  return data as QuestionItem[];
}

export async function saveQuestionInDb(question: QuestionItem) {
  if (question.id) {
    const { data, error } = await supabase
      .from('questions')
      .update({
        question_text: question.question_text,
        options: question.options,
        correct_answer: question.correct_answer,
        level: question.level,
        explanation: question.explanation,
        image_url: question.image_url ?? null,
      })
      .eq('id', question.id)
      .select()
      .single();

    if (error) return { success: false, error };
    return { success: true, data };
  } else {
    const { data, error } = await supabase
      .from('questions')
      .insert({
        task_id: question.task_id,
        package_id: question.package_id,
        question_text: question.question_text,
        options: question.options,
        correct_answer: question.correct_answer,
        level: question.level,
        explanation: question.explanation,
        image_url: question.image_url ?? null,
      })
      .select()
      .single();

    if (error) return { success: false, error };
    return { success: true, data };
  }
}

export async function deleteQuestionFromDb(questionId: string) {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId);

  if (error) return { success: false, error };
  return { success: true };
}

/* Audit Log API — nhật ký ghi đè cảnh báo quá tải */

export async function saveAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      task_id: log.task_id,
      task_title: log.task_title,
      teacher_id: user?.id ?? null,
      teacher_name: log.teacher_name || user?.user_metadata?.name || null,
      class_id: normalizeClassId(log.class_id) || null,
      subject_id: log.subject_id || null,
      reason: log.reason,
      severity: log.severity,
      excess_minutes: log.excess_minutes ?? null,
      deadline: log.deadline || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving audit log:', error.message);
    return { success: false, error };
  }
  return { success: true, data };
}

export async function fetchAuditLogs(classId?: string): Promise<AuditLog[]> {
  let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });

  const normalizedClassId = normalizeClassId(classId);
  if (normalizedClassId) query = query.eq('class_id', normalizedClassId);

  const { data, error } = await query;
  if (error) {
    console.warn('Error fetching audit logs:', error.message);
    return [];
  }

  return (data || []).map((d: any) => ({
    id: d.id,
    timestamp: d.created_at,
    task_id: d.task_id,
    task_title: d.task_title,
    teacher_id: d.teacher_id,
    teacher_name: d.teacher_name,
    class_id: d.class_id,
    subject_id: d.subject_id,
    reason: d.reason,
    severity: d.severity,
    excess_minutes: d.excess_minutes != null ? Number(d.excess_minutes) : undefined,
    deadline: d.deadline,
  }));
}

/* Question Packages API */

export async function fetchQuestionPackages(): Promise<QuestionPackage[]> {
  const { data: pkgs, error: pkgErr } = await supabase
    .from('question_packages')
    .select('*')
    .order('created_at', { ascending: false });

  if (pkgErr) {
    console.warn('Error fetching question_packages:', pkgErr.message);
    return [];
  }

  // Fetch question counts for each package
  const { data: questions, error: qErr } = await supabase
    .from('questions')
    .select('package_id');

  const countMap: Record<string, number> = {};
  if (!qErr && questions) {
    questions.forEach((q: any) => {
      if (q.package_id) {
        countMap[q.package_id] = (countMap[q.package_id] || 0) + 1;
      }
    });
  }

  return pkgs.map((p: any) => ({
    id: p.id,
    title: p.title,
    subject: p.subject,
    grade_class: p.grade_class,
    description: p.description,
    created_at: p.created_at,
    questions_count: countMap[p.id] || 0,
  }));
}

export async function createQuestionPackage(pkg: { title: string; subject: string; grade_class: string; description?: string }) {
  const { data, error } = await supabase
    .from('question_packages')
    .insert({
      title: pkg.title,
      subject: pkg.subject,
      grade_class: pkg.grade_class,
      description: pkg.description || '',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating package:', error.message);
    return { success: false, error };
  }
  return { success: true, data: data as QuestionPackage };
}

export async function deleteQuestionPackage(packageId: string) {
  const { error } = await supabase
    .from('question_packages')
    .delete()
    .eq('id', packageId);

  if (error) {
    console.error('Error deleting package:', error.message);
    return { success: false, error };
  }
  return { success: true };
}

export async function fetchQuestionsForPackage(packageId: string): Promise<QuestionItem[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('package_id', packageId)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('Error fetching questions for package:', error.message);
    return [];
  }
  return data as QuestionItem[];
}
