interface CategoryOptionProps {
  categoryId: string | number;
  categoryName: string;
  selectedId: string;
  onClick: (id: string | number) => void;
}

export default function CategoryOption({
  categoryId,
  categoryName,
  selectedId,
  onClick,
}: CategoryOptionProps) {
  const isSelected = String(selectedId) === String(categoryId);

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={() => onClick(categoryId)}
      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--surface-secondary)] transition-colors ${
        isSelected ? 'bg-[#003EC7]/10 text-[#003EC7] font-semibold' : 'text-[var(--foreground)]'
      }`}
    >
      {categoryName}
    </button>
  );
}
