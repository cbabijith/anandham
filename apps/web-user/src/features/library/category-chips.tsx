'use client';

type CategoryOption = { id: string; title: string; english: string; count: number };
export function CategoryChips({
  label,
  allLabel,
  total,
  options,
  value,
  onChange,
}: {
  label: string;
  allLabel: string;
  total: number;
  options: CategoryOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="category-browser">
      <div className="category-browser-heading">
        <span>{label}</span>
        <span className="category-swipe-hint">Swipe to browse →</span>
      </div>
      <div className="category-chips" role="group" aria-label={label}>
        <button
          type="button"
          className="category-chip"
          aria-label={`${allLabel} · ${total}`}
          aria-pressed={!value}
          onClick={() => onChange('')}
        >
          <span className="category-chip-label">{allLabel}</span>
          <span className="category-chip-count" aria-hidden="true">
            {total}
          </span>
        </button>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className="category-chip"
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
          >
            <span className="category-chip-label">
              <span lang="ml">{option.title}</span>
              {option.english && <small>{option.english}</small>}
            </span>
            <span className="category-chip-count">{option.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
