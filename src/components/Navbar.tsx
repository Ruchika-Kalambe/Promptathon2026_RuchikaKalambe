import { Activity, CalendarClock, ClipboardList, HeartPulse, Home, Info, Network, ShieldAlert } from 'lucide-react';

export type PageId = 'landing' | 'assessment' | 'workflow' | 'summary' | 'appointment' | 'emergency' | 'history' | 'about';

const NAV: { id: PageId; label: string; icon: typeof Home }[] = [
  { id: 'landing', label: 'Home', icon: Home },
  { id: 'assessment', label: 'Assessment', icon: Activity },
  { id: 'workflow', label: 'Agent Workflow', icon: Network },
  { id: 'summary', label: 'Health Summary', icon: ClipboardList },
  { id: 'appointment', label: 'Appointment', icon: CalendarClock },
  { id: 'emergency', label: 'Emergency', icon: ShieldAlert },
  { id: 'history', label: 'Health History', icon: HeartPulse },
  { id: 'about', label: 'About', icon: Info },
];

interface Props {
  current: PageId;
  onNavigate: (page: PageId) => void;
}

export default function Navbar({ current, onNavigate }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/30">
            <HeartPulse className="h-5 w-5 text-white" />
          </div>
          <div className="text-left leading-tight">
            <span className="block text-sm font-bold text-slate-800">MediMind AI</span>
            <span className="block text-[10px] text-slate-500">Virtual Health Assistant</span>
          </div>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => onNavigate('assessment')}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.03] active:scale-95"
        >
          Start Assessment
        </button>
      </div>

      {/* Mobile nav */}
      <div className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                active ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
              }`}
            >
              <Icon className="h-3 w-3" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
