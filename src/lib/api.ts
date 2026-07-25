import { supabase } from './supabase';
import { Task, WorkmapEntry } from './engine/types';

export interface QuestionItem {
  id?: string;
  task_id?: string | null;
  package_id?: string | null;
  question_text: string;
  options: string[];
  correct_answer: string;
  level: 'l1' | 'l2' | 'l3' | 'l4';
  explanation?: string;
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

    if (data && (data.name || data.class_id)) {
      return {
        name: data.name || '',
        classId: data.class_id || '10A5',
        school: data.school || 'THPT Chuyên Lê Quý Đôn',
        province: data.province || 'Đà Nẵng',
        avatar: data.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4',
        isOnboarded: true
      };
    }
  } catch (err) {
    console.warn('Could not fetch student profile from database:', err);
  }
  return null;
}

export async function saveStudentProfile(userId: string, profile: { name: string; classId: string; school: string; province: string; avatar: string }) {
  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        name: profile.name,
        class_id: profile.classId,
        school: profile.school,
        province: profile.province,
        avatar: profile.avatar,
        role: 'student'
      });

    if (error) {
      console.warn('Error saving student profile to users table:', error.message);
    }
  } catch (err) {
    console.error('Failed to save student profile to DB:', err);
  }
}

export async function fetchTasks(classId?: string) {
  let query = supabase.from('tasks').select('*');
  if (classId) {
    query = query.eq('class_id', classId);
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
    class_id: d.class_id,
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
  try {
    let query = supabase.from('workmap_entries').select('*, tasks!inner(class_id)');
    if (classId) {
      query = query.eq('tasks.class_id', classId);
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
  const insertPayload: any = {
    id: task.id,
    title: task.title,
    type: task.type,
    class_id: task.class_id,
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
        class_id: task.class_id,
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
  if (updates.class_id !== undefined) payload.class_id = updates.class_id;
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
