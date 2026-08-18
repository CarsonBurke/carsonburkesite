type IconProps = {
  size?: number;
  className?: string;
};

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 16 16",
  "aria-hidden": true,
  focusable: false as const,
});

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function GithubIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        fill="currentColor"
        d="M8 .5a7.5 7.5 0 0 0-2.37 14.62c.38.07.5-.16.5-.36v-1.3c-2.05.45-2.5-.9-2.5-.9-.34-.86-.83-1.09-.83-1.09-.68-.46.05-.45.05-.45.75.05 1.14.77 1.14.77.67 1.14 1.75.81 2.18.62.07-.48.26-.81.47-1-1.63-.19-3.35-.82-3.35-3.64 0-.8.29-1.46.76-1.97-.08-.19-.33-.94.07-1.96 0 0 .62-.2 2.02.75a6.9 6.9 0 0 1 3.68 0c1.4-.95 2.01-.75 2.01-.75.4 1.02.15 1.77.08 1.96.47.51.76 1.17.76 1.97 0 2.83-1.72 3.45-3.36 3.63.27.23.5.68.5 1.37v2.03c0 .2.13.44.51.36A7.5 7.5 0 0 0 8 .5Z"
      />
    </svg>
  );
}

export function MailIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" {...stroke} />
      <path d="m2.5 5 5.5 3.8L13.5 5" {...stroke} />
    </svg>
  );
}

export function ExternalIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M9.5 2.5h4v4" {...stroke} />
      <path d="M13.5 2.5 7.5 8.5" {...stroke} />
      <path d="M12 9.5v3a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3" {...stroke} />
    </svg>
  );
}

export function ChevronRightIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="m6 3.5 5 4.5-5 4.5" {...stroke} />
    </svg>
  );
}

export function ChevronDownIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="m3.5 6 4.5 5 4.5-5" {...stroke} />
    </svg>
  );
}

export function ArrowLeftIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M13 8H3.5" {...stroke} />
      <path d="M7 3.5 2.5 8 7 12.5" {...stroke} />
    </svg>
  );
}

export function SunIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="8" cy="8" r="3.2" {...stroke} />
      <path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3 3l1.2 1.2M11.8 11.8 13 13M13 3l-1.2 1.2M4.2 11.8 3 13" {...stroke} />
    </svg>
  );
}

export function MoonIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M13 10.2A5.6 5.6 0 0 1 5.8 3a5.6 5.6 0 1 0 7.2 7.2Z"
        {...stroke}
      />
    </svg>
  );
}

export function DisplayIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="1.5" y="2.5" width="13" height="9" rx="1.5" {...stroke} />
      <path d="M5.5 14h5" {...stroke} />
    </svg>
  );
}

export function CheckIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="m3 8.4 3.2 3.1L13 4.5" {...stroke} />
    </svg>
  );
}

export function CopyIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="5.5" y="5.5" width="8" height="9" rx="1.4" {...stroke} />
      <path d="M10.5 3.5v-1a1 1 0 0 0-1-1H3.5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h1" {...stroke} />
    </svg>
  );
}

export function PaletteIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M8 1.5a6.5 6.5 0 0 0 0 13c1 0 1.5-.6 1.5-1.3 0-1.5 1-1.7 2.2-1.7 1.7 0 2.8-1 2.8-3A6.5 6.5 0 0 0 8 1.5Z"
        {...stroke}
      />
      <circle cx="5.6" cy="6.2" r="1" fill="currentColor" />
      <circle cx="8.4" cy="4.8" r="1" fill="currentColor" />
      <circle cx="5" cy="9.4" r="1" fill="currentColor" />
    </svg>
  );
}
