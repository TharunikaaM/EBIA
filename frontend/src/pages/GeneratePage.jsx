import { ChevronRight, Globe, Sparkles, Wallet, BriefcaseBusiness } from 'lucide-react';
import BaseCard from '../components/ui/BaseCard';
import BaseInput from '../components/ui/BaseInput';
import BaseButton from '../components/ui/BaseButton';

function SelectorRow({ icon: Icon, label, value, onChange, placeholder, rightPill }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200/80 shadow-sm">
      <div className="flex min-w-0 items-center gap-4">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold tracking-wide text-slate-400">
            {label}
          </div>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="mt-1 w-full min-w-0 bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        {rightPill ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
            {rightPill}
          </span>
        ) : null}
        <ChevronRight className="h-5 w-5 text-slate-300" />
      </div>
    </div>
  );
}

export default function GeneratePage({
  workspaceQuery,
  setWorkspaceQuery,
  domain,
  setDomain,
  location,
  setLocation,
  budget,
  setBudget,
  businessModel,
  setBusinessModel,
  onGenerate,
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <BaseCard className="p-8">
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-800">Intelligence Workspace</div>
        </div>

        <div className="mt-6">
          <BaseInput
            value={workspaceQuery}
            onChange={(e) => setWorkspaceQuery(e.target.value)}
            placeholder="Describe a market gap or problem..."
            className="h-12 rounded-2xl"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <SelectorRow
            icon={Sparkles}
            label="DOMAIN"
            value={domain}
            onChange={setDomain}
            placeholder="Agri-Tech Automation"
          />
          <SelectorRow
            icon={Globe}
            label="TARGET LOCATION"
            value={location}
            onChange={setLocation}
            placeholder="Singapore"
            rightPill="SG"
          />
          <SelectorRow
            icon={Wallet}
            label="BUDGET"
            value={budget}
            onChange={setBudget}
            placeholder="<$50k"
          />
          <SelectorRow
            icon={BriefcaseBusiness}
            label="BUSINESS MODEL"
            value={businessModel}
            onChange={setBusinessModel}
            placeholder="Predictable recurring revenue"
          />
        </div>

        <div className="mt-8 flex justify-center">
          <BaseButton size="lg" className="w-56" onClick={onGenerate} disabled={!domain.trim()}>
            Generate Idea
          </BaseButton>
        </div>
      </BaseCard>
    </div>
  );
}

