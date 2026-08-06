import { AlertTriangle } from 'lucide-react';

export default function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-[11px] text-slate-400">
        MediMind AI is not a medical diagnosis system. Always consult a licensed healthcare professional.
      </p>
    );
  }
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <p className="text-sm text-amber-800">
        <span className="font-semibold">Disclaimer:</span> This application is an AI health guidance assistant and is{' '}
        <span className="font-semibold">NOT a medical diagnosis system</span>. Always consult a licensed healthcare
        professional for medical concerns.
      </p>
    </div>
  );
}
