"use client";

import { CATEGORY_LABELS, categoryColor, type Category } from "@/app/types";

type FilterPillsProps = {
  activeCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
};

const CATEGORIES: Category[] = ["academic", "popup", "arts", "workshops"];

export default function FilterPills({ activeCategory, onCategoryChange }: FilterPillsProps) {
  return (
    <div className="mb-7 flex items-center gap-2 overflow-x-auto whitespace-nowrap max-[480px]:-mx-4 max-[480px]:px-4">
      <span className="mr-0.5 shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">
        Filter —
      </span>
      {CATEGORIES.map((category) => {
        const active = activeCategory === category;
        const color = categoryColor(category);
        return (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(active ? null : category)}
            className={[
              "flex shrink-0 items-center gap-1.5 rounded-[3px] border-[0.5px] px-3 py-[5px] font-mono text-[9px] font-bold uppercase tracking-[0.07em] transition-opacity hover:opacity-80",
              active ? "border-solid" : "border-dashed bg-transparent",
            ].join(" ")}
            style={{
              borderColor: color,
              color,
              background: active ? `color-mix(in srgb, ${color} 12%, transparent)` : "transparent",
            }}
            aria-pressed={active}
          >
            <span className="h-[5px] w-[5px] rounded-[1px]" style={{ background: color }} />
            {CATEGORY_LABELS[category]}
          </button>
        );
      })}
    </div>
  );
}
