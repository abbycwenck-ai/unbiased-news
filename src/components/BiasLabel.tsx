import type { BiasLabel as BiasLabelType } from "@/types";

interface Props {
  label: BiasLabelType;
  size?: "sm" | "md";
}

const LABEL_STYLES: Record<BiasLabelType, string> = {
  "Far Left": "bg-blue-800 text-white",
  "Lean Left": "bg-blue-100 text-blue-800",
  Center: "bg-gray-100 text-gray-700",
  "Lean Right": "bg-orange-100 text-orange-800",
  "Far Right": "bg-red-100 text-red-800",
};

const LABEL_SHORT: Record<BiasLabelType, string> = {
  "Far Left": "L",
  "Lean Left": "L-",
  Center: "C",
  "Lean Right": "R-",
  "Far Right": "R",
};

export default function BiasLabel({ label, size = "md" }: Props) {
  const styles = LABEL_STYLES[label];
  const sizeClass =
    size === "sm"
      ? "px-1.5 py-0.5 text-[9px] font-semibold"
      : "px-2 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-block rounded-full leading-none ${sizeClass} ${styles}`}
      title={label}
    >
      {size === "sm" ? LABEL_SHORT[label] : label}
    </span>
  );
}
