import { Search } from 'lucide-react';

interface CategorySearchProps {
  value: string;
  onChange: (val: string) => void;
}

export default function CategorySearch({ value, onChange }: CategorySearchProps) {
  return (
    <div className="p-2 border-b border-[var(--border)] flex items-center gap-2 bg-[var(--surface-secondary)]">
      <Search className="w-4 h-4 text-[var(--muted)] shrink-0" />
      <input
        type="text"
        placeholder="Search Categories..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-0 text-sm focus:ring-0 focus:outline-hidden text-[var(--foreground)] placeholder-[var(--muted)]"
      />
    </div>
  );
}
