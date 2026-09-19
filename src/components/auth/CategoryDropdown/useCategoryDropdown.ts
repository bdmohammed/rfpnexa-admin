import { useEffect, useMemo, useRef, useState } from 'react';

import type { Category } from '@/types';

export interface UseCategoryDropdownProps {
  value: string;
  categories: Pick<Category, 'id' | 'name'>[] | undefined;
  onChange: (val: string) => void;
  onBlur: () => void;
}

export function useCategoryDropdown({
  value,
  categories,
  onChange,
  onBlur,
}: UseCategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set default selection to the first country ID if no value is provided
  useEffect(() => {
    if (!value && categories && categories.length > 0) {
      onChange(String(categories[0]!.id));
    }
  }, [value, categories, onChange]);

  const selectedCategory = useMemo(() => {
    if (!categories || !value) return undefined;
    return categories.find((c) => String(c.id) === String(value));
  }, [categories, value]);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [categories, searchTerm]);

  const handleSelect = (countryId: string | number) => {
    onChange(String(countryId));
    setIsOpen(false);
    setSearchTerm('');
    onBlur();
  };

  return {
    isOpen,
    setIsOpen,
    searchTerm,
    setSearchTerm,
    dropdownRef,
    selectedCategory,
    filteredCategories,
    handleSelect,
  };
}
