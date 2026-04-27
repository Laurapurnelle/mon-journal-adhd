import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState(() => JSON.parse(localStorage.getItem('events') || '[]'));
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('tasks') || '[]'));
  const [habits, setHabits] = useState(() => JSON.parse(localStorage.getItem('habits') || '[{"id":"1","name":"Skin Care"},{"id":"2","name":"Marche"},{"id":"3","name":"Eau"}]'));
  const [habitLogs, setHabitLogs] = useState(() => JSON.parse(localStorage.getItem('habitLogs') || '{}'));
  const [daysData, setDaysData] = useState(() => JSON.parse(localStorage.getItem('daysData') || '{}'));
  
  // Structure : { id, name, subTasks: [{ id, text, isWeekly, done }] }
  const [projects, setProjects] = useState(() => JSON.parse(localStorage.getItem('projects') || '[]'));

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('habitLogs', JSON.stringify(habitLogs));
    localStorage.setItem('daysData', JSON.stringify(daysData));
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [events, tasks, habits, habitLogs, daysData, projects]);

  const calculateMonthlySuccess = () => {
    const totalLogs = Object.values(habitLogs).flat().length;
    return Math.min(100, Math.round((totalLogs / 60) * 100));
  };

  return (
    <AppContext.Provider value={{
      events, setEvents, tasks, setTasks, habits, setHabits,
      habitLogs, setHabitLogs, daysData, setDaysData, projects, setProjects, calculateMonthlySuccess
    }}>{children}</AppContext.Provider>
  );
};
export const useApp = () => useContext(AppContext);