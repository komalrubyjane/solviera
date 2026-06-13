import { useState, useEffect } from 'react';
import SolveriaIntro from './components/SolveriaIntro';
import SolveriaHome from './components/SolveriaHome';

function App() {
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    const debugStatus = document.getElementById('debug-status');
    if (debugStatus) {
      debugStatus.style.display = 'none';
    }
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-brand-cream text-brand-charcoal overflow-x-hidden font-sans select-none">
      {/* Premium Luxury Paper Grain backdrop overlay */}
      <div className="grain-overlay" />

      {/* Render the editorial homepage in the background so it is loaded and ready */}
      <SolveriaHome />

      {/* Render the interactive intro sequence overlay on top */}
      {!introComplete && (
        <SolveriaIntro onComplete={() => setIntroComplete(true)} />
      )}
    </div>
  );
}

export default App;
