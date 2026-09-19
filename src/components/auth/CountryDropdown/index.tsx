import { AlertCircle, RefreshCw } from 'lucide-react';

import CountryOption from './CountryOption';
import CountrySearch from './CountrySearch';
import DropdownButton from './DropdownButton';
import { useCountryDropdown } from './useCountryDropdown';

import type { ListDistinctCountries } from '@/types';
import QueryBoundary from '@/components/query/QueryBoundary';
import { useCountries } from '@/features/country/api/queries';

export interface CountryDropdownProps {
  isActive?: boolean;
  value: string;
  onChange: (val: string) => void;
  onBlur: () => void;
  error?: string | undefined;
}

export default function CountryDropdown({ isActive, value, onChange, onBlur, error }: CountryDropdownProps) {
  const countriesQuery = useCountries(isActive);
  const countries = countriesQuery.data as unknown as ListDistinctCountries[];

  const {
    isOpen,
    setIsOpen,
    searchTerm,
    setSearchTerm,
    dropdownRef,
    selectedCountry,
    filteredCountries,
    handleSelect,
  } = useCountryDropdown({ value, countries, onChange, onBlur });
  const displayText = selectedCountry ? selectedCountry.name : 'Select Country';

  return (
    <div className="relative">
      <label
        htmlFor="country-dropdown-btn"
        className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2"
      >
        Country <span className="text-red-500">*</span>
      </label>

      <QueryBoundary
        query={countriesQuery}
        skeleton={
          <div className="w-full h-12 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center px-4 animate-pulse">
            <span className="text-xs text-[var(--muted)]">Loading countries...</span>
          </div>
        }
        error={(err, retry) => (
          <div className="w-full p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-between text-xs text-red-500">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{err instanceof Error ? err.message : 'Failed to load countries.'}</span>
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
              <CountrySearch value={searchTerm} onChange={setSearchTerm} />

              <div className="overflow-y-auto divide-y divide-[var(--border)]">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((c) => (
                    <CountryOption
                      key={c.id}
                      countryId={c.id}
                      countryName={c.name}
                      selectedId={value}
                      onClick={handleSelect}
                    />
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-[var(--muted)]">
                    No countries found
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
