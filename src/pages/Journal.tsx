import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const Journal = () => {
  const { tasks, setTasks, habits, setHabits, habitLogs, setHabitLogs, daysData, setDaysData, events, projects } = useApp();
  const today = new Date().toISOString().split('T')[0];
  
  // ÉTATS LOCAUX
  const [isEditingHabits, setIsEditingHabits] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  
  // LOGIQUE DU TIMER (Pomodoro)
  const [seconds, setSeconds] = useState(1500); // 25 minutes
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      alert("C'est l'heure d'une petite pause cerise ! 🍒");
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // LOGIQUE DES TÂCHES ÉTOILÉES (Boost Projet)
  const weeklyGoals = (projects || []).flatMap((p: any) => 
    (p.subTasks || []).filter((st: any) => st.isWeekly && !st.done).map((st: any) => ({ 
      ...st, 
      projectId: p.id, 
      projectName: p.name 
    }))
  );

  const addDailyTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTaskText, completed: false, date: today }]);
    setNewTaskText("");
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto pb-24 space-y-10">
      
      {/* HEADER : Date & Citation Hebdo */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <h1 className="title-big text-5xl md:text-7xl">
          {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(new Date())}
        </h1>
        <div className="sticker-card bg-rose-50 border-dashed border-2 border-rose-200 rotate-1 max-w-sm">
           <p className="text-[10px] font-black uppercase text-rose-400 mb-1">Citation de la semaine :</p>
           <p className="Caveat text-xl leading-tight">"Fais de ta vie un rêve, et d'un rêve une réalité." ✨</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* COLONNE 1 : TIMER & PHOTO & PENSÉE */}
        <div className="md:col-span-3 space-y-6">
          <div className="sticker-card text-center py-6">
            <h2 className="title-case text-sm mb-4">Cherry Timer</h2>
            <div className="text-6xl font-black text-rouge-cerise mb-6 tracking-tighter">
              {formatTime(seconds)}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsActive(!isActive)} className="btn-rose flex-1">
                {isActive ? 'PAUSE' : 'START'}
              </button>
              <button onClick={() => {setIsActive(false); setSeconds(1500);}} className="bg-gray-100 p-2 rounded-full text-xs">🔄</button>
            </div>
          </div>

          <div className="sticker-card bg-white rotate-[-1deg] border-rose-100">
            <p className="text-[10px] font-black text-orange-400 uppercase">Pensée du matin :</p>
            <p className="Caveat text-lg mt-2 italic">"Tu es capable de grandes choses aujourd'hui Laura ! 🍒"</p>
          </div>

          <div className="polaroid">
             <img src="https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=400" className="rounded-sm w-full h-48 object-cover" />
          </div>
        </div>

        {/* COLONNE 2 : AGENDA & TO-DO LIST */}
        <div className="md:col-span-6 space-y-6">
          <div className="sticker-card border-l-[12px] border-l-orange-200">
            <h2 className="title-case-orange text-xl mb-4 uppercase">Événements du jour</h2>
            <div className="space-y-2">
              {(events || []).filter((e:any) => e.date === today).map((e:any) => (
                <div key={e.id} className="flex items-center gap-3 p-2 bg-orange-50 rounded-xl">
                  <span className={`w-3 h-3 rounded-full ${e.type === 'pro' ? 'bg-blue-400' : 'bg-rouge-cerise'}`}></span>
                  <span className="font-bold text-texte-gris text-sm">{e.title}</span>
                </div>
              ))}
              {(events || []).filter((e:any) => e.date === today).length === 0 && (
                <p className="text-xs italic text-gray-300">Rien de prévu... libre comme l'air ! 🦋</p>
              )}
            </div>
          </div>

          <div className="sticker-card min-h-[450px]">
            <h2 className="title-case text-xl mb-4 underline decoration-rose-100">To-do List</h2>
            
            {/* BOOST PROJET ⭐ */}
            {weeklyGoals.length > 0 && (
              <div className="mb-6 p-4 bg-orange-50 rounded-2xl border-2 border-dashed border-orange-200">
                 <p className="text-[10px] font-black text-orange-400 uppercase mb-2">Boost Projet ⭐ :</p>
                 <div className="flex flex-wrap gap-2">
                    {weeklyGoals.map((goal: any) => (
                      <button key={goal.id} 
                        onClick={() => {
                          if(!tasks.find((t:any) => t.text.includes(goal.text))) {
                            setTasks([...tasks, { id: Date.now(), text: `[${goal.projectName}] ${goal.text}`, completed: false, date: today }]);
                          }
                        }}
                        className="bg-white p-2 rounded-xl text-[11px] Caveat shadow-sm hover:scale-105 transition-all border border-orange-100">
                        ➕ {goal.text}
                      </button>
                    ))}
                 </div>
              </div>
            )}

            <form onSubmit={addDailyTask} className="mb-6">
              <input 
                type="text" 
                value={newTaskText} 
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Ajouter une tâche pour aujourd'hui..."
                className="w-full p-2 border-b-2 border-rose-100 outline-none Caveat text-xl bg-transparent"
              />
            </form>

            <div className="space-y-3">
              {(tasks || []).filter((t:any) => !t.completed || t.date === today).map((t:any) => (
                <div key={t.id} className="flex items-center gap-3 text-2xl Caveat group">
                  <input type="checkbox" checked={t.completed} onChange={() => setTasks(tasks.map((tk:any) => tk.id === t.id ? {...tk, completed: !tk.completed} : tk))} className="w-6 h-6 accent-rouge-cerise cursor-pointer" />
                  <span className={t.completed ? "line-through text-gray-300" : "text-texte-gris"}>{t.text}</span>
                  <button onClick={() => setTasks(tasks.filter((tk:any) => tk.id !== t.id))} className="opacity-0 group-hover:opacity-100 text-[10px] text-red-300">supprimer</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLONNE 3 : HABITS & BRAIN DUMP & MOOD */}
        <div className="md:col-span-3 space-y-6">
          <div className="sticker-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="title-case text-sm">Habitudes</h2>
              <button onClick={() => setIsEditingHabits(!isEditingHabits)} className="text-[9px] font-black bg-rose-100 px-2 py-1 rounded-full uppercase">
                {isEditingHabits ? 'OK' : 'EDIT'}
              </button>
            </div>
            {(habits || []).map((h:any) => (
              <div key={h.id} className="flex justify-between items-center mb-3">
                {isEditingHabits ? (
                  <input 
                    value={h.name} 
                    onChange={(e) => setHabits(habits.map((hab:any) => hab.id === h.id ? {...hab, name: e.target.value} : hab))} 
                    className="text-[10px] bg-transparent border-b w-24 outline-none" 
                  />
                ) : (
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">{h.name}</span>
                )}
                <button 
                  onClick={() => {
                    const logs = habitLogs[h.id] || [];
                    setHabitLogs({...habitLogs, [h.id]: logs.includes(today) ? logs.filter(d => d !== today) : [...logs, today]});
                  }} 
                  className={`w-8 h-8 rounded-full border-2 transition-all ${habitLogs[h.id]?.includes(today) ? 'bg-rouge-cerise border-white scale-110 shadow-md' : 'bg-rose-50 border-rose-100'}`} 
                />
              </div>
            ))}
          </div>

          <div className="post-it min-h-[150px]">
             <h2 className="text-xl font-bold border-b border-yellow-300/50 mb-2">💡 Brain Dump</h2>
             <textarea 
               className="w-full bg-transparent outline-none h-24 Caveat text-lg resize-none" 
               placeholder="Une idée ? Une note vite faite..."
             />
          </div>

          <div className="sticker-card text-center">
            <h2 className="title-case text-xs mb-4">Mood du jour</h2>
            <div className="flex justify-around text-2xl">
              {['😊', '😐', '😔', '🤯'].map(emoji => (
                <button 
                  key={emoji} 
                  onClick={() => setDaysData({...daysData, [today]: {...daysData[today], mood: emoji}})}
                  className={`transition-all ${daysData[today]?.mood === emoji ? 'scale-150 drop-shadow-md' : 'grayscale opacity-30 hover:grayscale-0'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;