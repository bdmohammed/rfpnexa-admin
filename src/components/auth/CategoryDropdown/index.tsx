import { AlertCircle, RefreshCw } from 'lucide-react';

import CategoryOption from './CategoryOption';
import CategorySearch from './CategorySearch';
import DropdownButton from './DropdownButton';
import { useCategoryDropdown } from './useCategoryDropdown';

import type { Category } from '@/types';
import QueryBoundary from '@/components/query/QueryBoundary';
import { useDistinctCategories } from '@/features/categories';

export interface CategoryDropdownProps {
  value: string;
  onChange: (val: string) => void;
  onBlur: () => void;
  error?: string | undefined;
}

export default function CategoryDropdown({ value, onChange, onBlur, error }: CategoryDropdownProps) {
  const categoriesQuery = useDistinctCategories();
  const categories = categoriesQuery.data as unknown as Pick<Category, 'id' | 'name'>[];

  const {
    isOpen,
    setIsOpen,
    searchTerm,
    setSearchTerm,
    dropdownRef,
    selectedCategory,
    filteredCategories,
    handleSelect,
  } = useCategoryDropdown({ value, categories, onChange, onBlur });
  const displayText = selectedCategory ? selectedCategory.name : 'Select Category';

  return (
    <div className="relative">
      <label
        htmlFor="category-dropdown-btn"
        className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2"
      >
        Category <span className="text-red-500">*</span>
      </label>

      <QueryBoundary
        query={categoriesQuery}
        skeleton={
          <div className="w-full h-12 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center px-4 animate-pulse">
            <span className="text-xs text-[var(--muted)]">Loading Categories...</span>
          </div>
        }
        error={(err, retry) => (
          <div className="w-full p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-between text-xs text-red-500">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{err instanceof Error ? err.message : 'Failed to load Categories.'}</span>
            </div>
            <button
              type="button"
              onClick={retry}
              className="flex items-center gap-1 font-semibold text-[#003EC7] dark:text-blue-400 hover:underline inline-flex items-center"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Retry
            </button>
          </div>
        )}
      >
        <div ref={dropdownRef} className="relative">
          <DropdownButton
            displayText={displayText}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            error={error}
          />

          {isOpen && (
            <div
              role="listbox"
              className="absolute z-50 w-full mt-2 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-2xl overflow-hidden max-h-60 flex flex-col"
            >
              <CategorySearch value={searchTerm} onChange={setSearchTerm} />

              <div className="overflow-y-auto divide-y divide-[var(--border)]">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((c) => (
                    <CategoryOption
                      key={c.id}
                      categoryId={c.id}
                      categoryName={c.name}
                      selectedId={value}
                      onClick={handleSelect}
                    />
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-[var(--muted)]">
                    No Category found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </QueryBoundary>

      {error && <span className="text-xs text-red-500 mt-1 block">{error}</span>}
    </div>
  );
}
