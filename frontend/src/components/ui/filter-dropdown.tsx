'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export function FilterDropdown({ options, value, onChange, placeholder, className }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 h-9 px-3 rounded-xl border text-sm font-medium transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1',
          selected
            ? 'border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
        )}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-150', open && 'rotate-180')} />
      </button>

      {/* Dropdown list */}
      {open && (
        <div className="absolute z-50 mt-1.5 min-w-full w-max rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60 py-1 animate-fade-in">
          {/* "All" option to clear the filter */}
          <button
            type="button"
            onClick={() => handleSelect('')}
            className={cn(
              'flex items-center justify-between w-full px-3 py-2 text-sm transition-colors',
              !selected ? 'text-brand-600 font-medium' : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <span>{placeholder}</span>
            {!selected && <Check className="h-3.5 w-3.5" />}
          </button>

          <div className="my-1 border-t border-slate-100" />

          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 text-sm transition-colors',
                opt.value === value
                  ? 'text-brand-600 font-medium bg-brand-50'
                  : 'text-slate-700 hover:bg-slate-50'
              )}
            >
              <span>{opt.label}</span>
              {opt.value === value && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
