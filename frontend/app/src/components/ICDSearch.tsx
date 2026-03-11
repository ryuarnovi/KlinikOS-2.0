"use client";
import { useState, useEffect, useRef } from 'react';
import { icdService, ICD10, ICD9CM } from '@/services/icdService';
import { cn } from '@/utils/cn';

interface ICDSearchProps {
  type: 'icd10' | 'icd9cm';
  onSelect: (item: ICD10 | ICD9CM) => void;
  placeholder?: string;
  className?: string;
}

export function ICDSearch({ type, onSelect, placeholder, className }: ICDSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<(ICD10 | ICD9CM)[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = type === 'icd10' 
          ? await icdService.searchICD10(query)
          : await icdService.searchICD9CM(query);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error('Failed to search ICD:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, type]);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <i className={cn(
          "fi absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors",
          loading ? "fi-rr-spinner animate-spin" : "fi-rr-search"
        )} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder || `Cari ${type.toUpperCase()}...`}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-[60] mt-2 w-full max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item);
                setQuery('');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                  {item.code}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2 group-hover:text-slate-900 transition-colors">
                {item.description_id || item.description_en}
              </p>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-[60] mt-2 w-full rounded-xl border border-slate-200 bg-white p-6 shadow-xl text-center">
          <p className="text-sm text-slate-400">Data tidak ditemukan</p>
        </div>
      )}
    </div>
  );
}
