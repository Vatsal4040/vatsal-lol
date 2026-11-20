import { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function SvgIcon({
  size = 16,
  className,
  children,
  ...rest
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ? `icon ${className}` : 'icon'}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconMap(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </SvgIcon>
  );
}

export function IconBook(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M2 5.5A2.5 2.5 0 0 1 4.5 3H10a2 2 0 0 1 2 2v16a1.5 1.5 0 0 0-1.5-1.5H4.5A2.5 2.5 0 0 1 2 17V5.5Z" />
      <path d="M22 5.5A2.5 2.5 0 0 0 19.5 3H14a2 2 0 0 0-2 2v16a1.5 1.5 0 0 1 1.5-1.5h6A2.5 2.5 0 0 0 22 17V5.5Z" />
    </SvgIcon>
  );
}

export function IconEye(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </SvgIcon>
  );
}

export function IconEyeOff(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M10.7 5.1A10.6 10.6 0 0 1 12 5c6.2 0 10 7 10 7a17.6 17.6 0 0 1-3.1 4.1" />
      <path d="M6.6 6.6A17.7 17.7 0 0 0 2 12s3.8 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </SvgIcon>
  );
}

export function IconReset(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <polyline points="3 3 3 8 8 8" />
    </SvgIcon>
  );
}

export function IconVolumeOn(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.8 5.2a9.5 9.5 0 0 1 0 13.6" />
    </SvgIcon>
  );
}

export function IconVolumeOff(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </SvgIcon>
  );
}

export function IconPause(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </SvgIcon>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <polygon points="6 4 20 12 6 20 6 4" />
    </SvgIcon>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <polyline points="6 9 12 15 18 9" />
    </SvgIcon>
  );
}

export function IconChevronUp(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <polyline points="18 15 12 9 6 15" />
    </SvgIcon>
  );
}

export function IconAward(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="8.5" r="5.5" />
      <polyline points="8.5 13.5 7 22 12 19.5 17 22 15.5 13.5" />
    </SvgIcon>
  );
}

export function IconCompass(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9.5" />
      <polygon points="16.2 7.8 14.1 14.1 7.8 16.2 9.9 9.9 16.2 7.8" />
    </SvgIcon>
  );
}

export function IconNavigation(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <polygon points="3 11 21 3 13 21 11 13 3 11" />
    </SvgIcon>
  );
}

export function IconFlame(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 2.5c2.4 3.2 6.5 6.4 6.5 11.2a6.5 6.5 0 0 1-13 0c0-2.6 1.3-5.1 3-6.9-.1 1.6.7 2.8 1.9 3.2-.6-2.5.1-5.3 1.6-7.5Z" />
    </SvgIcon>
  );
}

export function IconInfo(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9.5" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </SvgIcon>
  );
}

export function IconArrowLeft(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </SvgIcon>
  );
}

export function IconArrowUp(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </SvgIcon>
  );
}

export function IconArrowDown(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </SvgIcon>
  );
}

export function IconZoomIn(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="11" cy="11" r="7.5" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </SvgIcon>
  );
}

export function IconZoomOut(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="11" cy="11" r="7.5" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </SvgIcon>
  );
}

export function IconCrosshair(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="7.5" />
      <line x1="22" y1="12" x2="18" y2="12" />
      <line x1="6" y1="12" x2="2" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="18" />
    </SvgIcon>
  );
}

export function IconClose(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </SvgIcon>
  );
}

export function IconGauge(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 14l4-4" />
      <path d="M3.4 17A9.5 9.5 0 1 1 20.6 17" />
    </SvgIcon>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9.5" />
      <polyline points="8.5 12.5 11 15 16 9.5" />
    </SvgIcon>
  );
}

export function IconSliders(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="9" cy="6" r="2" fill="currentColor" />
      <circle cx="15" cy="12" r="2" fill="currentColor" />
      <circle cx="11" cy="18" r="2" fill="currentColor" />
    </SvgIcon>
  );
}

export function IconRocket(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4.5 16.5c-1.5 1.3-2 4.5-2 4.5s3.2-.5 4.5-2a2.1 2.1 0 1 0-2.5-2.5Z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-4A12.8 12.8 0 0 1 21 3a12.8 12.8 0 0 1-5 10 22 22 0 0 1-4 2Z" />
      <path d="M9 12H4s.6-3 2-4c1.6-1.1 4-1 4-1" />
      <path d="M12 15v5s3-.6 4-2c1.1-1.6 1-4 1-4" />
    </SvgIcon>
  );
}

export function IconHelp(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M9.2 9.2a3 3 0 0 1 5.6 1.2c0 2-2.8 2.3-2.8 3.6" />
      <line x1="12" y1="17.5" x2="12.01" y2="17.5" />
    </SvgIcon>
  );
}

export function IconSparkles(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
      <path d="M19 3l.7 1.8L21.5 5.5 19.7 6.2 19 8l-.7-1.8-1.8-.7 1.8-.7L19 3Z" />
    </SvgIcon>
  );
}

export function IconSun(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2.5" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21.5" />
      <line x1="4.9" y1="4.9" x2="6.7" y2="6.7" />
      <line x1="17.3" y1="17.3" x2="19.1" y2="19.1" />
      <line x1="2.5" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="21.5" y2="12" />
      <line x1="4.9" y1="19.1" x2="6.7" y2="17.3" />
      <line x1="17.3" y1="6.7" x2="19.1" y2="4.9" />
    </SvgIcon>
  );
}

export function IconRuler(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M21.2 6.8l-4-4a1.2 1.2 0 0 0-1.7 0L2.8 15.5a1.2 1.2 0 0 0 0 1.7l4 4a1.2 1.2 0 0 0 1.7 0L21.2 8.5a1.2 1.2 0 0 0 0-1.7Z" />
      <line x1="14.5" y1="6.5" x2="16.5" y2="8.5" />
      <line x1="11.5" y1="9.5" x2="13.5" y2="11.5" />
      <line x1="8.5" y1="12.5" x2="10.5" y2="14.5" />
    </SvgIcon>
  );
}

export function IconClock(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9.5" />
      <polyline points="12 6.5 12 12 15.8 14" />
    </SvgIcon>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="16" y1="3" x2="16" y2="7" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </SvgIcon>
  );
}

export function IconOrbit(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="2.8" />
      <ellipse cx="12" cy="12" rx="9.5" ry="4.2" transform="rotate(-28 12 12)" />
      <circle cx="18.2" cy="8.4" r="1.4" fill="currentColor" />
    </SvgIcon>
  );
}

export function IconThermometer(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a3.8 3.8 0 1 0 4 0Z" />
    </SvgIcon>
  );
}

export function IconHourglass(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <line x1="5" y1="3" x2="19" y2="3" />
      <line x1="5" y1="21" x2="19" y2="21" />
      <path d="M7 3v4.2a5 5 0 0 0 5 4.8 5 5 0 0 0 5-4.8V3" />
      <path d="M7 21v-4.2a5 5 0 0 1 5-4.8 5 5 0 0 1 5 4.8V21" />
    </SvgIcon>
  );
}

export function IconLock(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </SvgIcon>
  );
}

export function IconRefresh(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.5 15a8.8 8.8 0 1 1-2.2-9.2L23 10" />
    </SvgIcon>
  );
}

export function IconHome(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
    </SvgIcon>
  );
}

export function IconTag(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="8" cy="8" r="1.3" fill="currentColor" />
    </SvgIcon>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="6" y="2.5" width="12" height="19" rx="2.2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </SvgIcon>
  );
}

export function IconSatellite(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.8" />
      <path d="M4 7l3.5 3.5-2 2L2 9l2-2Z" />
      <path d="M20 17l-3.5-3.5 2-2 3.5 3.5-2 2Z" />
      <line x1="7.5" y1="10.5" x2="9.5" y2="10.5" />
      <line x1="14.5" y1="13.5" x2="16.5" y2="13.5" />
      <path d="M15.5 5a4.5 4.5 0 0 1 3.5 3.5" />
    </SvgIcon>
  );
}
