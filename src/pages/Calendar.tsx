import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const FR_MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
];

const Calendar = () => {
  const {
    events, setEvents,
    daysData,
    projects, setProjects,
    budget, setBudget,
    calculateMonthlySuccess,
    getMonthlySpent,
    monthlyNotes, setMonthlyNotes,
    monthlyTodo, setMonthlyTodo,
  } = useApp();

  // Navigation de mois
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const { year, month } = viewDate;
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rawFirstDay = new Date(year, month, 1).getDay(); // 0=Dim
  const firstDayOffset = (rawFirstDay + 6) % 7; // Lundi=0 ... Dim=6

  const prevMonth = () => setViewDate(v => {
    const d = new Date(v.year, v.month - 1, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const nextMonth = () => setViewDate(v => {
    const d = new Date(v.year, v.month + 1, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const today = new Date().toISOString().split('T')[0];
  const isCurrentMonth = today.startsWith(monthKey);

  // Modal événement
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventInput, setEventInput] = useState({ title: '', type: 'perso', time: '' });

  const openModal = (date: string, event?: any) => {
    setSelectedDate(date);
    if (event) {
      setEditingEventId(event.id);
      setEventInput({ title: event.title, type: event.type, time: event.time || '' });
    } else {
      setEditingEventId(null);
      setEventInput({ title: '', type: 'perso', time: '' });
    }
    setShowModal(true);
  };

  const saveEvent = () => {
    if (!eventInput.title.trim()) return;
    if (editingEventId) {
      setEvents(events.map((e: any) => e.id === editingEventId ? { ...e, ...eventInput } : e));
    } else {
      setEvents([...(events || []), { id: Date.now().toString(), date: selectedDate, ...eventInput }]);
    }
    setShowModal(false);
  };

  const deleteEvent = () => {
    setEvents(events.filter((e: any) => e.id !== editingEventId));
    setShowModal(false);
  };

  // Projets
  const [newProjName, setNewProjName] = useState('');

  const handleAddProject = () => {
    if (!newProjName.trim()) return;
    setProjects([...(projects || []), { id: Date.now().toString(), name: newProjName, subTasks: [] }]);
    setNewProjName('');
  };

  const addSubTask = (projectId: string, text: string) => {
    if (!text.trim()) return;
    setProjects(projects.map((p: any) =>
      p.id === projectId
        ? { ...p, subTasks: [...(p.subTasks || []), { id: Date.now().toString(), text, isWeekly: false, done: false }] }
        : p
    ));
  };

  // Budget mensuel
  const [showBudgetEdit, setShowBudgetEdit] = useState(false);
  const monthlySpent = getMonthlySpent(monthKey);
  const monthlyRemaining = (budget?.monthlyLimit || 600) - monthlySpent;
  const monthlyPct = Math.min(100, Math.round((monthlySpent / (budget?.monthlyLimit || 600)) * 100));

  const successRate = calculateMonthlySuccess(monthKey);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 pb-28 relative">

      {/* ═══ HEADER ═══ */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b-4 border-rose-100 pb-5">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth}
            className="w-10 h-10 bg-rose-50 hover:bg-rose-100 rounded-full font-black text-rose-400 transition-all active:scale-90">‹</button>
          <h1 className="title-big text-4xl md:text-6xl uppercase tracking-tighter">
            {FR_MONTHS[month]} {year}
          </h1>
          <button onClick={nextMonth}
            className="w-10 h-10 bg-rose-50 hover:bg-rose-100 rounded-full font-black text-rose-400 transition-all active:scale-90">›</button>
        </div>
        <div className="sticker-card p-4 text-center bg-white">
          <p className="text-[10px] font-black text-gray-300 uppercase mb-1 italic tracking-widest">Taux Habitudes</p>
          <div className="font-retro text-5xl text-rouge-cerise">{successRate}%</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ─── CALENDRIER ─── */}
        <section className="lg:col-span-7 sticker-card p-5 bg-white/90">
          <div className="grid grid-cols-7 gap-1.5 md:gap-2">
            {['LUN','MAR','MER','JEU','VEN','SAM','DIM'].map(d => (
              <div key={d} className="text-center text-[9px] font-black text-rose-300 mb-1 tracking-wider">{d}</div>
            ))}

            {/* Cellules vides avant le 1er */}
            {Array.from({ length: firstDayOffset }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Jours du mois */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = (events || []).filter((e: any) => e.date === dateStr);
              const isToday = dateStr === today;
              const mood = daysData[dateStr]?.mood;

              return (
                <div
                  key={day}
                  onClick={() => openModal(dateStr)}
                  className={`aspect-square border-2 rounded-2xl p-1 relative cursor-pointer transition-all duration-150 overflow-hidden
                    ${isToday ? 'border-rouge-cerise bg-rose-50 shadow-md' : 'border-rose-50 bg-white hover:border-rose-200 hover:scale-105 hover:shadow-sm hover:z-10'}`}
                >
                  <span className={`text-[10px] font-black leading-none ${isToday ? 'text-rouge-cerise' : 'text-gray-300'}`}>{day}</span>
                  {mood && <span className="absolute top-0.5 right-0.5 text-xs">{mood}</span>}
                  <div className="mt-0.5 space-y-px">
                    {dayEvents.slice(0, 3).map((e: any) => (
                      <div
                        key={e.id}
                        onClick={(ev) => { ev.stopPropagation(); openModal(dateStr, e); }}
                        className={`h-1.5 w-full rounded-full cursor-pointer ${e.type === 'pro' ? 'bg-blue-400' : 'bg-rouge-cerise'} opacity-80 hover:opacity-100`}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[7px] text-gray-400 font-black text-center">+{dayEvents.length - 3}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Légende */}
          <div className="flex gap-4 mt-4 pt-3 border-t border-rose-50">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
              <span className="w-3 h-1.5 bg-rouge-cerise rounded-full" />Perso
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
              <span className="w-3 h-1.5 bg-blue-400 rounded-full" />Pro
            </div>
            {isCurrentMonth && (
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold ml-auto">
                <span className="w-3 h-3 rounded-lg border-2 border-rouge-cerise inline-block" /> Aujourd'hui
              </div>
            )}
          </div>
        </section>

        {/* ─── PROJETS + BUDGET ─── */}
        <aside className="lg:col-span-5 space-y-6">

          {/* Budget mensuel */}
          <div className="sticker-card border-l-[10px] border-l-green-200">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-retro uppercase text-green-500 tracking-wider text-lg">💸 Budget Mensuel</h2>
              <button onClick={() => setShowBudgetEdit(!showBudgetEdit)}
                className="text-[9px] font-black bg-green-50 hover:bg-green-100 px-2 py-1 rounded-full uppercase text-green-400 transition-all">
                {showBudgetEdit ? '✓ OK' : 'RÉGLER'}
              </button>
            </div>

            {showBudgetEdit && (
              <div className="mb-4 p-3 bg-green-50 rounded-2xl flex gap-3 items-center">
                <label className="text-[10px] font-black text-green-400 uppercase">Limite / mois :</label>
                <input
                  type="number"
                  value={budget?.monthlyLimit || 600}
                  onChange={(e) => setBudget((b: any) => ({ ...b, monthlyLimit: parseFloat(e.target.value) || 0 }))}
                  className="w-24 p-1 text-sm text-center font-bold border-b-2 border-green-200 outline-none bg-transparent"
                />
                <span className="text-sm text-green-400">€</span>
              </div>
            )}

            <div className="flex items-end justify-between mb-2">
              <div>
                <span className={`text-3xl font-black ${monthlyRemaining >= 0 ? 'text-green-500' : 'text-rouge-cerise'}`}>
                  {monthlyRemaining >= 0 ? '+' : ''}{monthlyRemaining.toFixed(0)}€
                </span>
                <span className="text-xs text-gray-400 ml-1">restants</span>
              </div>
              <span className="text-xs text-gray-400 font-bold">{monthlySpent.toFixed(2)}€ / {budget?.monthlyLimit || 600}€</span>
            </div>

            <div className="w-full bg-green-50 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${monthlyPct >= 100 ? 'bg-rouge-cerise' : monthlyPct >= 80 ? 'bg-orange-400' : 'bg-green-400'}`}
                style={{ width: `${Math.min(100, monthlyPct)}%` }}
              />
            </div>
          </div>

          {/* Projets */}
          <div className="sticker-card bg-rose-50 border-rose-200 min-h-[380px]">
            <h2 className="title-case text-lg mb-4">📂 Mes Projets</h2>

            <div className="flex gap-2 mb-5">
              <input
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
                placeholder="Nouveau projet..."
                className="flex-1 p-2 rounded-xl text-xs outline-none shadow-inner bg-white/60 focus:bg-white transition-all"
              />
              <button onClick={handleAddProject} className="btn-rose text-[9px]">CRÉER</button>
            </div>

            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {(projects || []).map((p: any) => (
                <div key={p.id} className="bg-white p-4 rounded-3xl shadow-sm border-2 border-white hover:border-rose-100 transition-all">
                  <h3 className="font-black text-rose-400 text-[11px] mb-3 uppercase tracking-widest flex items-center justify-between">
                    {p.name}
                    <button onClick={() => setProjects(projects.filter((proj: any) => proj.id !== p.id))}
                      className="text-gray-200 hover:text-red-300 text-[8px] transition-colors">✕ SUPPR</button>
                  </h3>

                  <input
                    onKeyDown={(e: any) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        addSubTask(p.id, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    placeholder="+ Ajouter une étape..."
                    className="w-full text-xs p-1 border-b border-rose-100 mb-3 outline-none font-handwriting focus:border-rose-300 bg-transparent"
                  />

                  <div className="space-y-2">
                    {(p.subTasks || []).map((st: any) => (
                      <div key={st.id} className="flex items-center justify-between group py-1 border-b border-rose-50 last:border-0">
                        <span className={`text-sm font-handwriting ${st.done ? 'line-through text-gray-300' : 'text-gray-600'}`}>{st.text}</span>
                        <div className="flex gap-2 items-center flex-shrink-0">
                          <button onClick={() => setProjects(projects.map((proj: any) =>
                            proj.id === p.id
                              ? { ...proj, subTasks: proj.subTasks.map((s: any) => s.id === st.id ? { ...s, isWeekly: !s.isWeekly } : s) }
                              : proj))}
                            title="Boost semaine"
                            className={`text-sm transition-all ${st.isWeekly ? 'text-orange-400 scale-125' : 'text-gray-200 hover:text-orange-300'}`}>⭐</button>
                          <button onClick={() => setProjects(projects.map((proj: any) =>
                            proj.id === p.id
                              ? { ...proj, subTasks: proj.subTasks.map((s: any) => s.id === st.id ? { ...s, done: !s.done } : s) }
                              : proj))}
                            className={`w-5 h-5 rounded-lg border-2 transition-all ${st.done ? 'bg-rose-400 border-rose-400 text-white text-xs flex items-center justify-center' : 'border-rose-100 bg-white hover:border-rose-300'}`}>
                            {st.done ? '✓' : ''}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {(projects || []).length === 0 && (
                <p className="text-xs italic text-gray-300 text-center py-6">Aucun projet pour l'instant...<br />Lance-toi ! 🚀</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ═══ POST-ITS PERSISTANTS ═══ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-4">
        <div className="post-it-rose min-h-[320px]">
          <h2 className="title-case text-2xl mb-3 underline decoration-white/60">📋 To-do Mensuelle</h2>
          <textarea
            className="w-full bg-transparent h-56 outline-none font-handwriting text-xl leading-relaxed resize-none"
            placeholder="Ici on note les gros trucs à faire ce mois-ci... ✍️"
            value={monthlyTodo}
            onChange={(e) => setMonthlyTodo(e.target.value)}
          />
        </div>
        <div className="post-it min-h-[320px]">
          <h2 className="title-case-orange text-2xl mb-3 underline decoration-white/60">💡 Notes & Brain Dump</h2>
          <textarea
            className="w-full bg-transparent h-56 outline-none font-handwriting text-xl leading-relaxed resize-none"
            placeholder="Un flash ? Une idée de génie ? Note tout en vrac ! 💡"
            value={monthlyNotes}
            onChange={(e) => setMonthlyNotes(e.target.value)}
          />
        </div>
      </section>

      {/* ═══ MODAL ÉVÉNEMENT ═══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-6 z-[100]"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="sticker-card p-8 w-full max-w-md bg-white border-8 border-white shadow-2xl">
            <h2 className="title-case text-xl mb-5 text-center">
              {editingEventId ? 'Modifier' : '✨ Ajouter au'}{' '}
              {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </h2>

            <input
              type="text"
              value={eventInput.title}
              onChange={(e) => setEventInput({ ...eventInput, title: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && saveEvent()}
              className="w-full p-3 border-b-4 border-rose-poudre outline-none mb-4 font-handwriting text-2xl text-center bg-transparent focus:border-rouge-cerise transition-colors"
              placeholder="C'est quoi le programme ?"
              autoFocus
            />

            <input
              type="time"
              value={eventInput.time}
              onChange={(e) => setEventInput({ ...eventInput, time: e.target.value })}
              className="w-full p-2 border-b-2 border-rose-100 outline-none mb-6 text-center text-sm text-gray-500 bg-transparent"
            />

            <div className="flex gap-4 mb-8">
              <button onClick={() => setEventInput({ ...eventInput, type: 'pro' })}
                className={`flex-1 py-3 rounded-3xl border-4 transition-all font-black text-xs ${eventInput.type === 'pro' ? 'border-blue-400 bg-blue-50 text-blue-500 scale-105' : 'border-gray-100 opacity-40'}`}>
                💻 PRO
              </button>
              <button onClick={() => setEventInput({ ...eventInput, type: 'perso' })}
                className={`flex-1 py-3 rounded-3xl border-4 transition-all font-black text-xs ${eventInput.type === 'perso' ? 'border-rouge-cerise bg-rose-50 text-rouge-cerise scale-105' : 'border-gray-100 opacity-40'}`}>
                🌸 PERSO
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={saveEvent} className="btn-rose py-4 text-sm tracking-[0.15em]">
                ENREGISTRER ✨
              </button>
              <div className="flex justify-between px-2 mt-1">
                <button onClick={() => setShowModal(false)}
                  className="text-[10px] font-black text-gray-300 uppercase hover:text-gray-500 transition-colors">Fermer</button>
                {editingEventId && (
                  <button onClick={deleteEvent}
                    className="text-[10px] font-black text-red-200 uppercase hover:text-red-400 transition-colors">Supprimer</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
