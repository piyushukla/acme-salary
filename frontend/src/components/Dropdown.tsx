import * as Select from "@radix-ui/react-select";

// Radix reserves "" as an internal value, so we map an empty selection
// (our "All …" option) to this sentinel and translate it back on change.
const ALL = "__all__";

export interface Option {
  value: string;
  label: string;
}

export function Dropdown({
  value,
  onValueChange,
  options,
  placeholder,
  width = "w-44",
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  width?: string;
}) {
  return (
    <Select.Root
      value={value || ALL}
      onValueChange={(v) => onValueChange(v === ALL ? "" : v)}
    >
      <Select.Trigger
        className={`inline-flex ${width} items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 data-[placeholder]:text-slate-400`}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <ChevronDown />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <Select.Viewport className="p-1">
            {options.map((o) => (
              <Select.Item
                key={o.value || ALL}
                value={o.value || ALL}
                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 outline-none data-[highlighted]:bg-slate-100 data-[state=checked]:font-medium"
              >
                <Select.ItemText>{o.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function ChevronDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-slate-400"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Check() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="text-slate-900"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
