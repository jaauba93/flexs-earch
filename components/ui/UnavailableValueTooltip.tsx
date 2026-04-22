'use client'

interface UnavailableValueTooltipProps {
  value: string
  tooltip: string
  className?: string
}

export default function UnavailableValueTooltip({
  value,
  tooltip,
  className = '',
}: UnavailableValueTooltipProps) {
  return (
    <span
      className={`group relative inline-flex items-center ${className}`}
    >
      <span
        tabIndex={0}
        className="inline-flex w-fit cursor-help items-center"
        aria-label={tooltip}
      >
        <span className="select-none blur-[2px] text-[#1C54F4] opacity-80">{value}</span>
      </span>
      <span className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 w-72 -translate-x-1/2 rounded-none border border-[#dbe4f8] bg-white px-3 py-2 text-[11px] font-normal leading-relaxed text-[#5c6d97] opacity-0 shadow-[0_12px_30px_rgba(0,7,89,0.12)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-within:-translate-y-0.5 group-focus-within:opacity-100">
        {tooltip}
      </span>
    </span>
  )
}
