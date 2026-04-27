import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Journal from './pages/Journal';
import Calendar from './pages/Calendar';

type Page = 'journal' | 'calendar';

const NAV = [
  { id: 'journal' as Page, label: 'Journal', icon: '📓' },
  { id: 'calendar' as Page, label: 'Mensuel', icon: '📅' },
];

const App = () => {
  const [currentPage, setCurrentPage] = useState<Page>('journal');

  return (
    <AppProvider>
      <div className="min-h-screen bg-creme pb-24">
        <main>
          {currentPage === 'journal' ? <Journal /> : <Calendar />}
        </main>

        {/* Navigation flottante */}
        <nav
          aria-label="Navigation principale"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 w-auto bg-white/85 backdrop-blur-lg px-3 py-2.5 flex gap-1 z-50 rounded-[40px] shadow-2xl border-4 border-white"
        >
          {NAV.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              aria-current={currentPage === id ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-black transition-all duration-200 ${
                currentPage === id
                  ? 'bg-rouge-cerise text-white shadow-md scale-105'
                  : 'text-gray-400 hover:text-rouge-cerise hover:bg-rose-50'
              }`}
            >
              <span>{icon}</span>
              <span className="uppercase tracking-widest">{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </AppProvider>
  );
};

export default App;
