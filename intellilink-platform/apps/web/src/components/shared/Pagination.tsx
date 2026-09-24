'use client';
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  total,
  totalPages: propTotalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = '',
}: PaginationProps) {
  const calculatedTotalPages = Math.max(1, Math.ceil(total / pageSize));
  const totalPages = propTotalPages !== undefined ? Math.max(1, propTotalPages) : calculatedTotalPages;

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(total, page * pageSize);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl text-xs text-slate-600 dark:text-slate-300 select-none ${className}`}
    >
      {/* Left side: Item counter and page size selector */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <span className="font-mono text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-900 dark:text-white">{startItem}</span> to{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{endItem}</span> of{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{total}</span> items
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#222E45] rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Page navigation */}
      <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-end">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          aria-label="First page"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-[#222E45] bg-slate-50 dark:bg-[#0D121D] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1A2333] hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Previous page"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-[#222E45] bg-slate-50 dark:bg-[#0D121D] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1A2333] hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Number Buttons */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) =>
            p === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 dark:text-slate-500 font-mono">
                ...
              </span>
            ) : (
              <button
                key={`page-${p}`}
                onClick={() => onPageChange(Number(p))}
                className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-mono font-medium transition-colors ${
                  page === p
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'border border-slate-200 dark:border-[#222E45] bg-slate-50 dark:bg-[#0D121D] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1A2333] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ),
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-[#222E45] bg-slate-50 dark:bg-[#0D121D] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1A2333] hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          aria-label="Last page"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-[#222E45] bg-slate-50 dark:bg-[#0D121D] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1A2333] hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
