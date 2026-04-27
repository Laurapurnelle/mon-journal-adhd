import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext<any>(null);

const DEFAULT_PHOTOS = [
  '/images/photo1.jpg',
  'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=400&q=80',
  'https://images.unsplash.com/photo-1490750967868-88df5691cc6c?w=400&q=80',
  'https://images.unsplash.com/photo-1455099318735-2be35e0b7dad?w=400&q=80',
];

const DEFAULT_HABITS = [
  { id: '1', name: 'Skin Care', icon: '✨' },
  { id: '2', name: 'Marche', icon: '🚶‍♀️' },
  { id: '3', name: 'Eau', icon: '💧' },
  { id: '4', name: 'Lecture', icon: '📖' },
];

const DEFAULT_BUDGET = {
  monthlyLimit: 600,
  dailyLimit: 25,
  spending: {} as Record<string, number>,
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState(() => JSON.parse(localStorage.getItem('events') || '[]'));
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('tasks') || '[]'));
  const [habits, setHabits] = useState(() => JSON.parse(localStorage.getItem('habits') || JSON.stringify(DEFAULT_HABITS)));
  const [habitLogs, setHabitLogs] = useState(() => JSON.parse(localStorage.getItem('habitLogs') || '{}'));
  const [daysData, setDaysData] = useState(() => JSON.parse(localStorage.getItem('daysData') || '{}'));
  const [projects, setProjects] = useState(() => JSON.parse(localStorage.getItem('projects') || '[]'));

  // Nouvelles données
  const [budget, setBudget] = useState(() => JSON.parse(localStorage.getItem('budget') || JSON.stringify(DEFAULT_BUDGET)));
  const [brainDump, setBrainDump] = useState(() => localStorage.getItem('brainDump') || '');
  const [monthlyNotes, setMonthlyNotes] = useState(() => localStorage.getItem('monthlyNotes') || '');
  const [monthlyTodo, setMonthlyTodo] = useState(() => localStorage.getItem('monthlyTodo') || '');
  const [slidePhotos, setSlidePhotos] = useState(() => JSON.parse(localStorage.getItem('slidePhotos') || JSON.stringify(DEFAULT_PHOTOS)));
  const [weeklyQuote, setWeeklyQuote] = useState(() => localStorage.getItem('weeklyQuote') || '"Fais de ta vie un rêve, et d\'un rêve une réalité." ✨');

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('habitLogs', JSON.stringify(habitLogs));
    localStorage.setItem('daysData', JSON.stringify(daysData));
    localStorage.setItem('projects', JSON.stringify(projects));
    localStorage.setItem('budget', JSON.stringify(budget));
    localStorage.setItem('brainDump', brainDump);
    localStorage.setItem('monthlyNotes', monthlyNotes);
    localStorage.setItem('monthlyTodo', monthlyTodo);
    localStorage.setItem('slidePhotos', JSON.stringify(slidePhotos));
    localStorage.setItem('weeklyQuote', weeklyQuote);
  }, [events, tasks, habits, habitLogs, daysData, projects, budget, brainDump, monthlyNotes, monthlyTodo, slidePhotos, weeklyQuote]);

  const calculateMonthlySuccess = (monthKey?: string) => {
    const now = new Date();
    const key = monthKey || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const totalPossible = habits.length * new Date(parseInt(key.split('-')[0]), parseInt(key.split('-')[1]), 0).getDate();
    const totalDone = Object.entries(habitLogs).reduce((acc: number, [habitId, dates]: [string, any]) => {
      return acc + (dates as string[]).filter((d: string) => d.startsWith(key)).length;
    }, 0);
    if (totalPossible === 0) return 0;
    return Math.min(100, Math.round((totalDone / totalPossible) * 100));
  };

  const addSpending = (date: string, amount: number) => {
    setBudget((prev: any) => ({
      ...prev,
      spending: { ...prev.spending, [date]: (prev.spending[date] || 0) + amount }
    }));
  };

  const getMonthlySpent = (monthKey: string) => {
    return Object.entries(budget.spending)
      .filter(([date]) => date.startsWith(monthKey))
      .reduce((sum, [, val]) => sum + (val as number), 0);
  };

  return (
    <AppContext.Provider value={{
      events, setEvents,
      tasks, setTasks,
      habits, setHabits,
      habitLogs, setHabitLogs,
      daysData, setDaysData,
      projects, setProjects,
      budget, setBudget,
      brainDump, setBrainDump,
      monthlyNotes, setMonthlyNotes,
      monthlyTodo, setMonthlyTodo,
      slidePhotos, setSlidePhotos,
      weeklyQuote, setWeeklyQuote,
      calculateMonthlySuccess,
      addSpending,
      getMonthlySpent,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
