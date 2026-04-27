import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Journal from './pages/Journal';
import Calendar from './pages/Calendar';

const App = () => {
  const [currentPage, setCurrentPage] = useState<'journal' | 'calendar'>('journal');

  return (
    <AppProvider>
      <div className="min-h-screen bg-creme pb-20">
        {currentPage === 'journal' ? <Journal /> : <Calendar />}

        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/80 backdrop-blur-md p-2 flex justify-around items-center z-50 rounded-[30px] shadow-xl border-4 border-white">
          <button 
            onClick={() => setCurrentPage('journal')}
            className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${currentPage === 'journal' ? 'bg-rouge-cerise text-white' : 'text-texte-gris'}`}
          >
            📓 JOURNAL
          </button>
          <button 
            onClick={() => setCurrentPage('calendar')}
            className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${currentPage === 'calendar' ? 'bg-rouge-cerise text-white' : 'text-texte-gris'}`}
          >
            📅 MENSUEL
          </button>
        </nav>
      </div>
    </AppProvider>
  );
};

export default App;