import { TaskStep } from './types';
import { addDays, format, parseISO, isAfter, isBefore } from 'date-fns';

export interface ScheduleResult {
  isFeasible: boolean;
  scheduledSteps: Record<string, string>; // step_name -> scheduled date
  reason?: string;
}

export const scheduleTaskSteps = (
  steps: TaskStep[],
  availableDates: string[], // Dates sorted from earliest to latest
  dailyCapacities: Record<string, number> // Date -> Available LU
): ScheduleResult => {
  const scheduledSteps: Record<string, string> = {};
  
  // Sort steps topologically based on dependencies. 
  // For simplicity, we assume steps are already sorted in a valid order
  
  for (const step of steps) {
    let scheduledDate: string | null = null;
    
    // Find the first available date that satisfies constraints
    for (const date of availableDates) {
      if (isBefore(parseISO(date), parseISO(step.earliest_start_date))) continue;
      if (isAfter(parseISO(date), parseISO(step.latest_finish_date))) break;
      
      // Check dependency
      if (step.dependency) {
        const depDate = scheduledSteps[step.dependency];
        if (!depDate || isAfter(parseISO(depDate), parseISO(date))) {
          continue; // Dependency not met yet
        }
      }
      
      // Check capacity (Assuming a step can be scheduled if there's enough LU)
      // In a real advanced system, splittable steps might span multiple days.
      if (dailyCapacities[date] >= step.estimated_LU) {
        scheduledDate = date;
        dailyCapacities[date] -= step.estimated_LU; // Reserve capacity
        break;
      }
    }
    
    if (!scheduledDate) {
      return {
        isFeasible: false,
        scheduledSteps: {},
        reason: `Cannot schedule step "${step.step_name}" within available capacity and timeframe.`
      };
    }
    
    scheduledSteps[step.step_name] = scheduledDate;
  }
  
  return {
    isFeasible: true,
    scheduledSteps
  };
};
