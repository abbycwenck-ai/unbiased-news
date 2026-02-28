import type { BiasLabel as BiasLabelType } from "@/types";

interface Props {
  label: BiasLabelType;
  size?: "sm" | "md" | "dot";
}

export const BIAS_CONFIG: Record<
  BiasLabelType,
  { bg: string; text: string; dot: string; border: string; leftBorder: string }
> = {
  "Far Left": {
    bg: "bg-blue-50",
    text: "text-blue-900",
    dot: "bg-blue-700",
    border: "border-blue-200",
    leftBorder: "border-l-blue-700",
  },
  "Lean Left": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
    border: "border-blue-100",
    leftBorder: "border-l-blue-400",
  },
  Center: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    dot: "bg-slate-400",
    border: "border-slate-200",
    leftBorder: "border-l-slate-400",
  },
  "Lean Right": {
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-400",
    border: "border-orange-100",
    leftBorder: "border-l-orange-400",
  },
  "Far Right": {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-600",
    border: "border-red-100",
    leftBorder: "border-l-red-600",
  },
};

export default function BiasLabel({ label, size = "md" }: Props) {
  const cfg = BIAS_CONFIG[label];

  if (size === "dot") {
    return (
      <span
        className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`}
        title={label}
      />
    );
  }

  if (size === "sm") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
        title={label}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {label}
    </span>
  );
}
