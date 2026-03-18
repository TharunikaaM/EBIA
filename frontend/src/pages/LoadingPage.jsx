import { BrainCircuit } from 'lucide-react';
import BaseCard from '../components/ui/BaseCard';

export default function LoadingPage({ message = 'Scanning market signals…' }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <BaseCard className="p-10">
        <div className="flex flex-col items-center text-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full ring-2 ring-blue-600/15" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-blue-600">
              <BrainCircuit className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 text-base font-semibold text-slate-900">Processing Signals</div>
          <div className="mt-2 text-xs font-semibold tracking-widest text-blue-600 uppercase">
            {message}
          </div>
        </div>
      </BaseCard>
    </div>
  );
}

