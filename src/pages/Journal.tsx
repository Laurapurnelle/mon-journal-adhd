import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const MOODS = [
  { emoji: '🥰', label: 'Au top' },
  { emoji: '😊', label: 'Bien' },
  { emoji: '😌', label: 'Sereine' },
  { emoji: '😐', label: 'Neutre' },
  { emoji: '😔', label: 'Triste' },
  { emoji: '😤', label: 'Frustrée' },
  { emoji: '🤯', label: 'Overwhelm' },
  { emoji: '😴', label: 'Fatiguée' },
];

const Journal = () => {
  const {
    tasks, setTasks,
    habits, setHabits,
    habitLogs, setHabitLogs,
    daysData, setDaysData,
    events,
    projects,
    budget, setBudget, addSpending,
    brainDump, setBrainDump,
    slidePhotos,
    weeklyQuote,
  } = useApp();

  const today = new Date().toISOString().split('T')[0];

  // --- Horloge ---
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // --- Diaporama photo ---
  const [photoIdx, setPhotoIdx] = useState(0);
  const [photoDir, setPhotoDir] = useState(1);
  useEffect(() => {
    if (!slidePhotos?.length) return;
    const t = setInterval(() => {
      setPhotoDir(1);
      setPhotoIdx(i => (i + 1) % slidePhotos.length);
    }, 6000);
    return () => clearInterval(t);
  }, [slidePhotos?.length]);

  const goPhoto = (dir: number) => {
    setPhotoDir(dir);
    setPhotoIdx(i => (i + dir + slidePhotos.length) % slidePhotos.length);
  };

  // --- Pomodoro ---
  const [seconds, setSeconds] = useState(1500);
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

  const formatPomodoro = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // --- Tâches ---
  const [newTaskText, setNewTaskText] = useState('');
  const [isEditingHabits, setIsEditingHabits] = useState(false);

  const addDailyTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTaskText, completed: false, date: today }]);
    setNewTaskText('');
  };

  const weeklyGoals = (projects || []).flatMap((p: any) =>
    (p.subTasks || [])
      .filter((st: any) => st.isWeekly && !st.done)
      .map((st: any) => ({ ...st, projectId: p.id, projectName: p.name }))
  );

  // --- Budget quotidien ---
  const [spendInput, setSpendInput] = useState('');
  const [showBudgetSettings, setShowBudgetSettings] = useState(false);
  const todaySpent = budget?.spending?.[today] || 0;
  const dailyRemaining = (budget?.dailyLimit || 25) - todaySpent;
  const dailyPct = Math.min(100, Math.round((todaySpent / (budget?.dailyLimit || 25)) * 100));

  const handleAddSpend = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(spendInput.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      addSpending(today, val);
      setSpendInput('');
    }
  };

  const todayEvents = (events || []).filter((e: any) => e.date === today);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-28 space-y-8">

      {/* ═══ HEADER ═══ */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs font-black text-rose-300 uppercase tracking-widest mb-1">
            {currentTime.toLocaleDateString('fr-FR', { weekday: 'long' })}
          </p>
          <h1 className="title-big text-5xl md:text-7xl leading-none">
            {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(new Date())}
          </h1>
        </div>

        {/* Horloge */}
        <div className="sticker-card text-center px-8 py-4 bg-rouge-cerise/5 border-rouge-cerise/20">
          <div className="font-retro text-4xl md:text-5xl text-rouge-cerise tabular-nums tracking-wider">
            {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xs font-black text-rose-300 tracking-widest mt-1 tabular-nums">
            {currentTime.toLocaleTimeString('fr-FR', { second: '2-digit' }).replace(/.*:/, ':')} s
          </div>
        </div>

        {/* Citation */}
        <div className="sticker-card bg-rose-50 border-dashed border-2 border-rose-200 rotate-1 max-w-xs">
          <p className="text-[10px] font-black uppercase text-rose-400 mb-1">Citation de la semaine :</p>
          <p className="font-handwriting text-lg leading-tight">{weeklyQuote}</p>
        </div>
      </header>

      {/* ═══ GRILLE PRINCIPALE ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

        {/* ─── COL 1 : Photo + Timer + Note ─── */}
        <aside className="md:col-span-3 space-y-5">

          {/* Diaporama photo */}
          <div className="polaroid group relative">
            <div className="relative overflow-hidden rounded-sm w-full h-52">
              <AnimatePresence mode="wait" custom={photoDir}>
                <motion.img
                  key={photoIdx}
                  src={slidePhotos?.[photoIdx]}
                  custom={photoDir}
                  initial={{ opacity: 0, x: photoDir * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: photoDir * -40 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=400'; }}
                />
              </AnimatePresence>
            </div>
            {/* Nav dots */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {(slidePhotos || []).map((_: any, i: number) => (
                <button key={i} onClick={() => { setPhotoDir(i > photoIdx ? 1 : -1); setPhotoIdx(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === photoIdx ? 'bg-rouge-cerise scale-125' : 'bg-white/60'}`} />
              ))}
            </div>
            {/* Arrow nav */}
            <button onClick={() => goPhoto(-1)}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/80 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow">‹</button>
            <button onClick={() => goPhoto(1)}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/80 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow">›</button>
          </div>

          {/* Cherry Timer */}
          <div className="sticker-card text-center py-5">
            <h2 className="title-case text-xs mb-3">🍒 Cherry Timer</h2>
            <div className="font-retro text-5xl text-rouge-cerise mb-4 tracking-tighter">
              {formatPomodoro(seconds)}
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setIsActive(!isActive)} className="btn-rose flex-1">
                {isActive ? '⏸ PAUSE' : '▶ START'}
              </button>
              <button onClick={() => { setIsActive(false); setSeconds(1500); }}
                className="bg-rose-50 hover:bg-rose-100 p-2 rounded-full text-sm transition-all">🔄</button>
            </div>
          </div>

          {/* Note du matin */}
          <div className="sticker-card bg-white rotate-[-1deg] border-rose-100">
            <p className="text-[10px] font-black text-orange-400 uppercase">Pensée du matin :</p>
            <p className="font-handwriting text-lg mt-2 italic text-texte-gris">"Tu es capable de grandes choses aujourd'hui ! 🌸"</p>
          </div>
        </aside>

        {/* ─── COL 2 : Événements + Budget + To-do ─── */}
        <main className="md:col-span-6 space-y-5">

          {/* Événements du jour */}
          <div className="sticker-card border-l-[10px] border-l-orange-200">
            <h2 className="title-case-orange text-lg mb-3 uppercase">📅 Événements du jour</h2>
            {todayEvents.length > 0 ? (
              <div className="space-y-2">
                {todayEvents.map((e: any) => (
                  <div key={e.id} className="flex items-center gap-3 p-2 bg-orange-50 rounded-2xl">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${e.type === 'pro' ? 'bg-blue-400' : 'bg-rouge-cerise'}`} />
                    <span className="font-bold text-texte-gris text-sm">{e.title}</span>
                    {e.time && <span className="text-xs text-gray-400 ml-auto">{e.time}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-gray-300">Rien de prévu... libre comme l'air ! 🦋</p>
            )}
          </div>

          {/* Budget quotidien */}
          <div className="sticker-card border-l-[10px] border-l-green-200">
            <div className="flex justify-between items-center mb-3">
              <h2 className="title-case text-lg" style={{ color: '#22c55e' }}>💸 Budget du jour</h2>
              <button onClick={() => setShowBudgetSettings(!showBudgetSettings)}
                className="text-[9px] font-black bg-green-50 px-2 py-1 rounded-full uppercase text-green-400 hover:bg-green-100 transition-all">
                {showBudgetSettings ? 'OK' : 'RÉGLER'}
              </button>
            </div>

            {showBudgetSettings && (
              <div className="mb-4 p-3 bg-green-50 rounded-2xl flex gap-3 items-center">
                <label className="text-[10px] font-black text-green-400 uppercase">Limite / jour :</label>
                <input
                  type="number"
                  value={budget?.dailyLimit || 25}
                  onChange={(e) => setBudget((b: any) => ({ ...b, dailyLimit: parseFloat(e.target.value) || 0 }))}
                  className="w-20 p-1 text-sm text-center font-bold border-b-2 border-green-200 outline-none bg-transparent"
                />
                <span className="text-sm text-green-400">€</span>
              </div>
            )}

            <div className="flex items-end justify-between mb-2">
              <div>
                <span className={`text-3xl font-black ${dailyRemaining >= 0 ? 'text-green-500' : 'text-rouge-cerise'}`}>
                  {dailyRemaining >= 0 ? '+' : ''}{dailyRemaining.toFixed(0)}€
                </span>
                <span className="text-xs text-gray-400 ml-1">restants / {budget?.dailyLimit || 25}€</span>
              </div>
              <span className="text-xs text-gray-400 font-bold">{todaySpent.toFixed(2)}€ dépensés</span>
            </div>

            {/* Barre de progression */}
            <div className="w-full bg-green-50 rounded-full h-3 mb-4 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${dailyPct >= 100 ? 'bg-rouge-cerise' : dailyPct >= 75 ? 'bg-orange-400' : 'bg-green-400'}`}
                style={{ width: `${Math.min(100, dailyPct)}%` }}
              />
            </div>

            {/* Ajouter une dépense */}
            <form onSubmit={handleAddSpend} className="flex gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={spendInput}
                onChange={(e) => setSpendInput(e.target.value)}
                placeholder="Montant (€)"
                className="flex-1 p-2 border-b-2 border-green-100 outline-none font-handwriting text-lg bg-transparent focus:border-green-300 transition-colors"
              />
              <button type="submit"
                className="bg-green-400 hover:bg-green-500 text-white font-black px-4 rounded-full text-sm transition-all active:scale-95">
                + Ajouter
              </button>
            </form>
          </div>

          {/* To-do List */}
          <div className="sticker-card min-h-[380px]">
            <h2 className="title-case text-lg mb-4 underline decoration-rose-100">✅ To-do List</h2>

            {weeklyGoals.length > 0 && (
              <div className="mb-5 p-4 bg-orange-50 rounded-2xl border-2 border-dashed border-orange-200">
                <p className="text-[10px] font-black text-orange-400 uppercase mb-2">Boost Projet ⭐ :</p>
                <div className="flex flex-wrap gap-2">
                  {weeklyGoals.map((goal: any) => (
                    <button key={goal.id}
                      onClick={() => {
                        if (!tasks.find((t: any) => t.text.includes(goal.text))) {
                          setTasks([...tasks, { id: Date.now(), text: `[${goal.projectName}] ${goal.text}`, completed: false, date: today }]);
                        }
                      }}
                      className="bg-white p-2 rounded-xl text-[11px] font-handwriting shadow-sm hover:scale-105 transition-all border border-orange-100">
                      ➕ {goal.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={addDailyTask} className="mb-5">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Ajouter une tâche pour aujourd'hui..."
                className="w-full p-2 border-b-2 border-rose-100 outline-none font-handwriting text-xl bg-transparent focus:border-rouge-cerise transition-colors"
              />
            </form>

            <div className="space-y-2.5">
              {(tasks || [])
                .filter((t: any) => !t.completed || t.date === today)
                .map((t: any) => (
                  <div key={t.id} className="flex items-center gap-3 font-handwriting text-xl group">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => setTasks(tasks.map((tk: any) => tk.id === t.id ? { ...tk, completed: !tk.completed } : tk))}
                      className="w-5 h-5 accent-rouge-cerise cursor-pointer flex-shrink-0"
                    />
                    <span className={t.completed ? 'line-through text-gray-300 flex-1' : 'text-texte-gris flex-1'}>{t.text}</span>
                    <button
                      onClick={() => setTasks(tasks.filter((tk: any) => tk.id !== t.id))}
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-red-300 hover:text-red-400 transition-all">✕</button>
                  </div>
                ))}
              {tasks.filter((t: any) => !t.completed || t.date === today).length === 0 && (
                <p className="text-xs italic text-gray-300 text-center pt-8">Aucune tâche pour l'instant ✨<br />Profites-en !</p>
              )}
            </div>
          </div>
        </main>

        {/* ─── COL 3 : Habitudes + Mood + Brain Dump ─── */}
        <aside className="md:col-span-3 space-y-5">

          {/* Habitudes */}
          <div className="sticker-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="title-case text-xs">🌱 Habitudes</h2>
              <button onClick={() => setIsEditingHabits(!isEditingHabits)}
                className="text-[9px] font-black bg-rose-100 hover:bg-rose-200 px-2 py-1 rounded-full uppercase transition-all">
                {isEditingHabits ? '✓ OK' : 'ÉDITER'}
              </button>
            </div>
            <div className="space-y-3">
              {(habits || []).map((h: any) => {
                const done = habitLogs[h.id]?.includes(today);
                return (
                  <div key={h.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{h.icon || '✦'}</span>
                      {isEditingHabits ? (
                        <input
                          value={h.name}
                          onChange={(e) => setHabits(habits.map((hab: any) => hab.id === h.id ? { ...hab, name: e.target.value } : hab))}
                          className="text-[10px] bg-transparent border-b border-rose-200 w-20 outline-none"
                        />
                      ) : (
                        <span className="text-[11px] font-black text-gray-500 uppercase tracking-tighter">{h.name}</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const logs = habitLogs[h.id] || [];
                        setHabitLogs({
                          ...habitLogs,
                          [h.id]: logs.includes(today)
                            ? logs.filter((d: string) => d !== today)
                            : [...logs, today],
                        });
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${done ? 'bg-rouge-cerise border-white scale-110 shadow-md text-white text-xs' : 'bg-rose-50 border-rose-100 hover:border-rose-300'}`}
                    >
                      {done ? '✓' : ''}
                    </button>
                  </div>
                );
              })}
              {isEditingHabits && (
                <button
                  onClick={() => setHabits([...habits, { id: Date.now().toString(), name: 'Nouvelle habitude', icon: '✦' }])}
                  className="text-[10px] text-rose-300 hover:text-rouge-cerise transition-all font-black w-full text-center pt-1">
                  + Ajouter
                </button>
              )}
            </div>
          </div>

          {/* Mood du jour */}
          <div className="sticker-card">
            <h2 className="title-case text-xs mb-4">🎭 Mood du jour</h2>
            <div className="grid grid-cols-4 gap-2">
              {MOODS.map(({ emoji, label }) => {
                const selected = daysData[today]?.mood === emoji;
                return (
                  <button
                    key={emoji}
                    onClick={() => setDaysData({ ...daysData, [today]: { ...daysData[today], mood: emoji } })}
                    title={label}
                    className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${selected ? 'bg-rose-50 scale-110 shadow-sm' : 'opacity-40 hover:opacity-80'}`}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="text-[8px] font-bold text-gray-400">{label}</span>
                  </button>
                );
              })}
            </div>
            {daysData[today]?.mood && (
              <p className="text-center text-xs italic text-gray-400 mt-3">
                Humeur : {MOODS.find(m => m.emoji === daysData[today].mood)?.label}
              </p>
            )}
          </div>

          {/* Post-it Brain Dump (persistant) */}
          <div className="post-it min-h-[180px]">
            <h2 className="font-handwriting text-xl font-bold border-b border-yellow-300/50 mb-2">💡 Brain Dump</h2>
            <textarea
              className="w-full bg-transparent outline-none h-32 font-handwriting text-lg resize-none leading-relaxed"
              placeholder="Une idée ? Une note vite faite..."
              value={brainDump}
              onChange={(e) => setBrainDump(e.target.value)}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Journal;
