import { AiExtraction } from "@/types/email";
import { Calendar, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const SmartActionRail = ({ 
  extractions, 
  onSelect 
}: { 
  extractions: AiExtraction[], 
  onSelect: (ex: AiExtraction) => void 
}) => {
  if (extractions.length === 0) return null;

  return (
    <div className="w-12 border-l border-[var(--border-subtle)] bg-[var(--bg-1)] flex flex-col items-center py-4 gap-4 shrink-0">
      {extractions.map((ex) => (
        <button 
          key={ex.id} 
          className="group relative p-2 rounded-lg bg-[var(--ryze-accent-soft)] hover:bg-[var(--ryze-accent)] transition-all duration-200 text-[var(--ryze-accent)] hover:text-[var(--ryze-accent-fg)] shadow-sm"
          onClick={() => onSelect(ex)}
          title={ex.type === 'event' ? 'Schedule Event' : 'Create Task'}
        >
          {ex.type === 'event' ? <Calendar size={18} /> : <CheckCircle2 size={18} />}
          <span className="absolute left-[-4px] top-[-4px] flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--ryze-accent)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--ryze-accent)]"></span>
          </span>
        </button>
      ))}
    </div>
  );
};
