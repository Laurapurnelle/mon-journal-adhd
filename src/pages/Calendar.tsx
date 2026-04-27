import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const Calendar = () => {
  const { events, setEvents, daysData, projects, setProjects, calculateMonthlySuccess } = useApp();
  
  // ÉTATS POUR LA MODAL ÉVÉNEMENT
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventInput, setEventInput] = useState({ title: '', type: 'perso' });

  // ÉTAT POUR LA CRÉATION DE PROJET
  const [newProjName, setNewProjName] = useState('');

  // --- LOGIQUE ÉVÉNEMENTS ---
  const openModal = (date: string, event?: any) => {
    setSelectedDate(date);
    if (event) {
      setEditingEventId(event.id);
      setEventInput({ title: event.title, type: event.type });
    } else {
      setEditingEventId(null);
      setEventInput({ title: '', type: 'perso' });
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

  // --- LOGIQUE PROJETS ---
  const handleAddProject = () => {
    if (!newProjName.trim()) return;
    setProjects([...(projects || []), { id: Date.now().toString(), name: newProjName, subTasks: [] }]);
    setNewProjName('');
  };

  const addSubTask = (projectId: string, text: string) => {
    setProjects(projects.map((p: any) => p.id === projectId ? 
      { ...p, subTasks: [...(p.subTasks || []), { id: Date.now().toString(), text, isWeekly: false, done: false }] } : p));
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12 pb-24 relative">
      
      {/* HEADER : Titre Y2K & Success Score */}
      <div className="flex justify-between items-end border-b-4 border-rose-100 pb-4">
        <h1 className="title-big text-5xl md:text-8xl uppercase tracking-tighter">AVRIL 2026</h1>
        <div className="sticker-card bg-white p-4 text-center">
          <p className="text-[10px] font-black text-gray-300 uppercase mb-1 italic tracking-widest">Success Rate</p>
          <div className="text-5xl font-black text-rouge-cerise">{calculateMonthlySuccess()}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* CALENDRIER GÉANT (7 Colonnes) */}
        <div className="lg:col-span-7 sticker-card p-6 bg-white/90">
           <div className="grid grid-cols-7 gap-2 md:gap-3">
              {['LUN','MAR','MER','JEU','VEN','SAM','DIM'].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-rose-300 mb-2">{d}</div>
              ))}
              {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                const dateStr = `2026-04-${day.toString().padStart(2, '0')}`;
                const dayEvents = (events || []).filter((e: any) => e.date === dateStr);
                return (
                  <div key={day} onClick={() => openModal(dateStr)} 
                  className="aspect-square border border-rose-50 rounded-2xl p-1 relative bg-white sticker-interactive transition-all overflow-hidden">
                    <span className="text-[11px] font-bold text-gray-300">{day}</span>
                    
                    {/* Mood sync */}
                    {daysData[dateStr]?.mood && <span className="absolute top-1 right-1 text-sm">{daysData[dateStr].mood}</span>}
                    
                    {/* Points événements cliquables */}
                    <div className="mt-1 space-y-0.5">
                       {dayEvents.map((e: any) => (
                         <div key={e.id} onClick={(event) => { event.stopPropagation(); openModal(dateStr, e); }}
                         className={`h-2 w-full rounded-full ${e.type === 'pro' ? 'bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.5)]' : 'bg-rouge-cerise shadow-[0_0_5px_rgba(210,20,58,0.4)]'} opacity-80 cursor-pointer hover:scale-110`}></div>
                       ))}
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

        {/* SECTION PROJETS ÉVOLUÉE (5 Colonnes) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticker-card bg-rose-50 border-rose-200 min-h-[450px]">
            <h2 className="title-case text-xl mb-4">📂 Mes Projets</h2>
            
            <div className="flex gap-2 mb-6">
              <input value={newProjName} onChange={(e) => setNewProjName(e.target.value)} 
                     onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
                     placeholder="Nouveau projet..." className="flex-1 p-2 rounded-xl text-xs outline-none shadow-inner bg-white/50" />
              <button onClick={handleAddProject} className="btn-rose text-[9px]">CRÉER</button>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
              {(projects || []).map((p: any) => (
                <div key={p.id} className="bg-white p-4 rounded-3xl shadow-sm border-2 border-white transition-all hover:border-rose-100">
                  <h3 className="font-bold text-rose-400 text-[11px] mb-3 uppercase tracking-widest flex items-center justify-between">
                    {p.name}
                    <button onClick={() => setProjects(projects.filter((proj:any) => proj.id !== p.id))} className="text-gray-200 hover:text-red-300 text-[8px]">SUPPRIMER</button>
                  </h3>
                  
                  <input onKeyDown={(e: any) => e.key === 'Enter' && (addSubTask(p.id, e.currentTarget.value), e.currentTarget.value = '')}
                         placeholder="+ Ajouter une étape..." className="w-full text-xs p-1 border-b border-rose-100 mb-3 outline-none Caveat focus:border-rose-300" />
                  
                  <div className="space-y-2">
                    {(p.subTasks || []).map((st: any) => (
                      <div key={st.id} className="flex items-center justify-between group py-1 border-b border-rose-50 last:border-0">
                        <span className={`text-[14px] Caveat ${st.done ? 'line-through text-gray-300' : 'text-gray-600'}`}>{st.text}</span>
                        <div className="flex gap-2 items-center">
                          {/* Étoile pour le Boost Semaine */}
                          <button onClick={() => {
                            setProjects(projects.map((proj:any) => proj.id === p.id ? { ...proj, subTasks: proj.subTasks.map((s:any) => s.id === st.id ? {...s, isWeekly: !s.isWeekly} : s)} : proj));
                          }} className={`text-sm transition-all ${st.isWeekly ? 'text-orange-400 scale-125 drop-shadow-sm' : 'text-gray-200 grayscale opacity-30 hover:opacity-100'}`}>⭐</button>
                          
                          {/* Case à cocher */}
                          <button onClick={() => {
                            setProjects(projects.map((proj:any) => proj.id === p.id ? { ...proj, subTasks: proj.subTasks.map((s:any) => s.id === st.id ? {...s, done: !s.done} : s)} : proj));
                          }} className={`w-5 h-5 rounded-lg border-2 transition-all ${st.done ? 'bg-rose-400 border-rose-400 shadow-inner' : 'border-rose-100 bg-white hover:border-rose-300'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER : POST-ITS POUR NOTES & TO-DO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6">
        <div className="post-it-rose min-h-[350px]">
          <h2 className="title-case text-2xl mb-4 underline decoration-white">To-do Mensuelle</h2>
          <textarea className="w-full bg-transparent h-56 outline-none text-2xl Caveat leading-relaxed resize-none" 
          placeholder="Ici on note les gros trucs à faire ce mois-ci... ✍️" />
        </div>
        <div className="post-it min-h-[350px]">
          <h2 className="title-case-orange text-2xl mb-4 underline decoration-white">Notes & Brain Dump</h2>
          <textarea className="w-full bg-transparent h-56 outline-none text-2xl Caveat leading-relaxed resize-none" 
          placeholder="Un flash ? Une idée de génie ? Note tout en vrac ! 💡" />
        </div>
      </div>

      {/* MODAL : AJOUT & ÉDITION ÉVÉNEMENT */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
          <div className="sticker-card p-8 w-full max-w-md bg-white border-8 border-white shadow-2xl">
            <h2 className="title-case text-2xl mb-6 text-center">
              {editingEventId ? 'Modifier' : 'Ajouter au'} {new Date(selectedDate || "").toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </h2>
            
            <input type="text" value={eventInput.title} onChange={(e) => setEventInput({ ...eventInput, title: e.target.value })}
                   className="w-full p-4 border-b-4 border-rose-poudre outline-none mb-8 text-2xl Caveat text-center" placeholder="C'est quoi le programme ?" />
            
            <div className="flex gap-4 mb-10">
              <button onClick={() => setEventInput({ ...eventInput, type: 'pro' })} 
                className={`flex-1 py-4 rounded-3xl border-4 transition-all font-bold text-xs ${eventInput.type === 'pro' ? 'border-blue-400 bg-blue-50 text-blue-500 scale-105' : 'border-gray-50 opacity-40 grayscale'}`}>💻 PRO</button>
              <button onClick={() => setEventInput({ ...eventInput, type: 'perso' })} 
                className={`flex-1 py-4 rounded-3xl border-4 transition-all font-bold text-xs ${eventInput.type === 'perso' ? 'border-rouge-cerise bg-rose-50 text-rouge-cerise scale-105' : 'border-gray-50 opacity-40 grayscale'}`}>🌸 PERSO</button>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={saveEvent} className="btn-rose py-4 text-sm tracking-[0.2em]">ENREGISTRER ✨</button>
              <div className="flex justify-between px-2 mt-2">
                <button onClick={() => setShowModal(false)} className="text-[10px] font-black text-gray-300 uppercase hover:text-gray-500 transition-colors">Fermer</button>
                {editingEventId && (
                  <button onClick={deleteEvent} className="text-[10px] font-black text-red-200 uppercase hover:text-red-400 transition-colors">Supprimer</button>
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