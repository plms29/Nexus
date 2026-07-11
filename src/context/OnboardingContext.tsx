'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SubjectGroup = 'natural' | 'social';

export interface OnboardingState {
  teacherName: string;
  schoolName: string;
  subjectGroup: SubjectGroup;
  selectedSubjects: string[];
  selectedClasses: string[];
}

interface OnboardingContextType {
  state: OnboardingState;
  updateState: (updates: Partial<OnboardingState>) => void;
  resetState: () => void;
}

const initialState: OnboardingState = {
  teacherName: '',
  schoolName: '',
  subjectGroup: 'natural',
  selectedSubjects: [],
  selectedClasses: [],
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initialState);

  const updateState = (updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState(initialState);
  };

  return (
    <OnboardingContext.Provider value={{ state, updateState, resetState }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
