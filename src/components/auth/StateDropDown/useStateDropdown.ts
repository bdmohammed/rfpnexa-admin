import { useEffect, useMemo, useRef, useState } from 'react';

import type { ListDistinctCountries } from '@/types';

export interface UseStateDropdownProps {
  value: string;
  countries: ListDistinctCountries[] | undefined;
  onChange: (val: string) => void;
  onBlur: () => void;
}

export function useStateDropdown({
  value,
  countries,
  onChange,
  onBlur,
}: UseStateDropdownProps) {
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
    if (!value && countries && countries.length > 0) {
      onChange(String(countries[0]!.id));
    }
  }, [value, countries, onChange]);

  const selectedCountry = useMemo(() => {
    if (!countries || !value) return undefined;
    return countries.find((c) => String(c.id) === String(value));
  }, [countries, value]);

  const filteredCountries = useMemo(() => {
    if (!countries) return [];
    return countries.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [countries, searchTerm]);

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
    selectedCountry,
    filteredCountries,
    handleSelect,
  };
}
