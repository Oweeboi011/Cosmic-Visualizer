export interface ToggleOption<T extends string> {
  value: T;
  label: string;
}

/** Single-select pill buttons. Each button reports its state with `aria-pressed`. */
export function ToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  /** Accessible name for the group. */
  label: string;
  options: readonly ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            value === option.value
              ? "border-nebula-primary bg-nebula-primary/15 text-nebula-primary"
              : "border-space-border text-text-muted hover:border-nebula-primary hover:text-text-primary"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
