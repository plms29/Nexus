import { supabase } from './supabase';
import { Task, WorkmapEntry } from './engine/types';

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
  
  // Transform DB snake_case to TS camelCase if needed, but our TS types are currently mostly snake_case
  // Types: { id, title, type, class_id, subject_id, deadline, isGroup, topic, learning_objectives }
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
  })) as Task[];
}

export async function fetchWorkmap(classId?: string) {
  // If we need to filter by classId, we need to join with tasks.
  let query = supabase.from('workmap_entries').select('*, tasks!inner(class_id)');
  if (classId) {
    query = query.eq('tasks.class_id', classId);
  }

  const { data, error } = await query;
  if (error) {
    console.warn('Supabase missing table (workmap_entries):', error.message);
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
  // 1. Insert Task
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .insert({
      id: task.id, // Supabase can generate, but we can also pass our generated uuid
      title: task.title,
      type: task.type,
      class_id: task.class_id,
      subject_id: task.subject_id,
      deadline: task.deadline,
      is_group: task.isGroup,
    })
    .select()
    .single();

  if (taskError) {
    console.error('Error inserting task:', taskError.message);
    return { success: false, error: taskError };
  }

  // 2. Insert Workmap Entries
  if (entries.length > 0) {
    const entriesToInsert = entries.map(e => ({
      date: e.date,
      subject_group: e.subject_group,
      minutes: e.minutes,
      lu: e.lu,
      task_id: taskData.id, // Ensure we use the actual DB id if it generated one
      step_name: e.step_name,
    }));

    const { error: entriesError } = await supabase
      .from('workmap_entries')
      .insert(entriesToInsert);

    if (entriesError) {
      console.error('Error inserting workmap entries:', entriesError.message);
      // Rollback is manual in JS if not using RPC, but we can ignore for prototype
      return { success: false, error: entriesError };
    }
  }

  return { success: true, task: taskData };
}
