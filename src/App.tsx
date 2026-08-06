import { useState } from 'react';
import Navbar, { type PageId } from '@/components/Navbar';
import About from '@/pages/About';
import AgentWorkflow from '@/pages/AgentWorkflow';
import AppointmentRecommendation from '@/pages/AppointmentRecommendation';
import Assessment from '@/pages/Assessment';
import EmergencyGuidance from '@/pages/EmergencyGuidance';
import HealthHistory from '@/pages/HealthHistory';
import HealthSummary from '@/pages/HealthSummary';
import Landing from '@/pages/Landing';
import Disclaimer from '@/components/Disclaimer';
import type { AssessmentResult } from '@/lib/types';

function App() {
  const [page, setPage] = useState<PageId>('landing');
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const navigate = (p: PageId) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-bg min-h-screen">
      <Navbar current={page} onNavigate={navigate} />
      <main>
        {page === 'landing' && <Landing onNavigate={navigate} />}
        {page === 'assessment' && <Assessment onNavigate={navigate} onResult={setResult} />}
        {page === 'workflow' && <AgentWorkflow onNavigate={navigate} />}
        {page === 'summary' && <HealthSummary result={result} onNavigate={navigate} />}
        {page === 'appointment' && <AppointmentRecommendation result={result} onNavigate={navigate} />}
        {page === 'emergency' && <EmergencyGuidance result={result} onNavigate={navigate} />}
        {page === 'history' && <HealthHistory onNavigate={navigate} />}
        {page === 'about' && <About onNavigate={navigate} />}
      </main>
      <footer className="border-t border-white/40 bg-white/50 px-4 py-6 backdrop-blur">
        <div className="mx-auto max-w-7xl">
          <Disclaimer />
          <p className="mt-3 text-center text-xs text-slate-400">
            MediMind AI — Your Intelligent Health Guidance Companion · Built for the Agentic AI Competition
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
