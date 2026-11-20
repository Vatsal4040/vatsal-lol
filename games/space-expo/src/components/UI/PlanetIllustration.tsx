interface PlanetIllustrationProps {
  id: string;
  size?: number;
  locked?: boolean;
}

/**
 * Hand-crafted miniature vector illustration for every celestial body and orbital satellite,
 * displayed in Info Cards, Discovery Journal badges, and Universe Map.
 */
export function PlanetIllustration({
  id,
  size = 64,
  locked = false,
}: PlanetIllustrationProps) {
  if (locked) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="40"
          cy="40"
          r="24"
          fill="#1E293B"
          stroke="#475569"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <text
          x="40"
          y="47"
          textAnchor="middle"
          fill="#94A3B8"
          fontSize="22"
          fontWeight="700"
          fontFamily="Fredoka, sans-serif"
        >
          ?
        </text>
      </svg>
    );
  }

  switch (id) {
    case 'sun':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <defs>
            <radialGradient id="sunGrad" cx="38%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EA580C" />
            </radialGradient>
          </defs>
          <circle cx="40" cy="40" r="34" fill="#FBBF24" opacity="0.22" />
          <circle cx="40" cy="40" r="26" fill="url(#sunGrad)" />
          <circle cx="31" cy="31" r="6" fill="#FEF9C3" opacity="0.55" />
        </svg>
      );

    case 'earth':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="30" fill="#38BDF8" opacity="0.2" />
          <circle cx="40" cy="40" r="24" fill="#0284C7" />
          <path
            d="M27 28 C33 23 41 25 43 31 C45 36 39 40 34 39 C29 38 24 33 27 28Z"
            fill="#22C55E"
          />
          <path
            d="M44 37 C52 34 60 39 58 47 C56 54 48 56 44 50 C41 46 41 40 44 37Z"
            fill="#16A34A"
          />
          <path
            d="M24 46 C29 44 35 48 33 54 C31 58 24 55 24 46Z"
            fill="#22C55E"
          />
          <rect x="20" y="34" width="16" height="4.5" rx="2.2" fill="#FFFFFF" opacity="0.88" />
          <rect x="44" y="27" width="14" height="4" rx="2" fill="#FFFFFF" opacity="0.82" />
          <rect x="35" y="52" width="15" height="4" rx="2" fill="#FFFFFF" opacity="0.85" />
        </svg>
      );

    case 'iss-station':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <line x1="12" y1="40" x2="68" y2="40" stroke="#CBD5E1" strokeWidth="3.5" />
          <rect x="14" y="18" width="9" height="18" rx="1.5" fill="#D97706" stroke="#FDE68A" strokeWidth="1" />
          <rect x="14" y="44" width="9" height="18" rx="1.5" fill="#D97706" stroke="#FDE68A" strokeWidth="1" />
          <rect x="57" y="18" width="9" height="18" rx="1.5" fill="#D97706" stroke="#FDE68A" strokeWidth="1" />
          <rect x="57" y="44" width="9" height="18" rx="1.5" fill="#D97706" stroke="#FDE68A" strokeWidth="1" />
          <rect x="34" y="25" width="12" height="30" rx="5" fill="#F8FAFC" />
          <circle cx="40" cy="40" r="4" fill="#38BDF8" />
        </svg>
      );

    case 'hubble-telescope':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <g transform="rotate(-24 40 40)">
            <rect x="12" y="34" width="16" height="12" rx="1.5" fill="#0284C7" stroke="#BAE6FD" strokeWidth="1" />
            <rect x="52" y="34" width="16" height="12" rx="1.5" fill="#0284C7" stroke="#BAE6FD" strokeWidth="1" />
            <rect x="31" y="18" width="18" height="44" rx="4" fill="#E2E8F0" />
            <rect x="30" y="44" width="20" height="14" rx="2" fill="#94A3B8" />
            <ellipse cx="40" cy="18" rx="9" ry="3.5" fill="#1E293B" />
          </g>
        </svg>
      );

    case 'gps-satellite':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <rect x="10" y="33" width="20" height="14" rx="1.5" fill="#0369A1" stroke="#7DD3FC" strokeWidth="1" />
          <rect x="50" y="33" width="20" height="14" rx="1.5" fill="#0369A1" stroke="#7DD3FC" strokeWidth="1" />
          <rect x="32" y="29" width="16" height="16" rx="2" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="1.2" />
          <circle cx="40" cy="54" r="3" fill="#34D399" />
          <path d="M32 59 Q40 65 48 59" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />
          <path d="M27 64 Q40 72 53 64" fill="none" stroke="#34D399" strokeWidth="1.6" opacity="0.65" strokeLinecap="round" />
        </svg>
      );

    case 'europa':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="24" fill="#E2E8F0" />
          <path d="M20 35 Q40 27 60 39" fill="none" stroke="#B45309" strokeWidth="1.8" opacity="0.7" />
          <path d="M22 48 Q42 54 58 42" fill="none" stroke="#9A3412" strokeWidth="1.6" opacity="0.65" />
          <path d="M32 19 Q38 40 48 61" fill="none" stroke="#B45309" strokeWidth="1.4" opacity="0.55" />
          <circle cx="32" cy="30" r="6" fill="#F8FAFC" opacity="0.55" />
        </svg>
      );

    case 'titan':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="29" fill="#F59E0B" opacity="0.22" />
          <circle cx="40" cy="40" r="23" fill="#D97706" />
          <path d="M20 34 Q40 28 60 34" stroke="#FDE68A" strokeWidth="4" fill="none" opacity="0.55" />
          <path d="M22 47 Q40 53 58 46" stroke="#92400E" strokeWidth="3.5" fill="none" opacity="0.55" />
        </svg>
      );

    case 'saturn':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <ellipse
            cx="40"
            cy="42"
            rx="35"
            ry="11"
            transform="rotate(-18 40 42)"
            fill="none"
            stroke="#FDE68A"
            strokeWidth="6"
            opacity="0.72"
          />
          <circle cx="40" cy="40" r="19" fill="#F5D08A" />
          <path d="M22 36 Q40 31 58 36" stroke="#D97706" strokeWidth="3" fill="none" opacity="0.45" />
          <path d="M23 45 Q40 49 57 45" stroke="#B45309" strokeWidth="3" fill="none" opacity="0.4" />
          <path
            d="M8 52 A35 11 -18 0 0 72 32"
            fill="none"
            stroke="#FEF08A"
            strokeWidth="5"
          />
        </svg>
      );

    case 'jupiter':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <clipPath id="jupClip">
            <circle cx="40" cy="40" r="25" />
          </clipPath>
          <circle cx="40" cy="40" r="25" fill="#F3DFC1" />
          <g clipPath="url(#jupClip)">
            <rect x="12" y="20" width="56" height="7" fill="#C87D4B" />
            <rect x="12" y="32" width="56" height="6" fill="#D97706" opacity="0.8" />
            <rect x="12" y="44" width="56" height="8" fill="#B45309" opacity="0.75" />
            <ellipse cx="49" cy="47" rx="8" ry="5" fill="#EA580C" stroke="#FEF3C7" strokeWidth="1.2" />
          </g>
        </svg>
      );

    case 'mars':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="28" fill="#FB923C" opacity="0.18" />
          <circle cx="40" cy="40" r="23" fill="#EA580C" />
          <path d="M31 18 Q40 23 49 18 A23 23 0 0 0 31 18Z" fill="#F8FAFC" />
          <circle cx="32" cy="36" r="5" fill="#C2410C" />
          <circle cx="49" cy="46" r="6.5" fill="#9A3412" opacity="0.75" />
        </svg>
      );

    case 'uranus':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <ellipse
            cx="40"
            cy="40"
            rx="10"
            ry="32"
            transform="rotate(14 40 40)"
            fill="none"
            stroke="#CFFAFE"
            strokeWidth="3"
            opacity="0.75"
          />
          <circle cx="40" cy="40" r="21" fill="#67E8F9" />
          <circle cx="33" cy="33" r="6" fill="#ECFEFF" opacity="0.45" />
        </svg>
      );

    case 'neptune':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="28" fill="#3B82F6" opacity="0.22" />
          <circle cx="40" cy="40" r="22" fill="#2563EB" />
          <path d="M21 35 Q40 31 59 36" stroke="#93C5FD" strokeWidth="3" fill="none" opacity="0.65" />
          <ellipse cx="45" cy="46" rx="7" ry="4" fill="#1E3A8A" />
        </svg>
      );

    case 'pluto':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="21" fill="#C59A78" />
          <path
            d="M40 50 C31 44 29 35 34 33 C37 32 39 35 40 37 C41 35 43 32 46 33 C51 35 49 44 40 50Z"
            fill="#F8F1E7"
          />
        </svg>
      );

    case 'venus':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="28" fill="#FDE68A" opacity="0.2" />
          <circle cx="40" cy="40" r="22" fill="#F5B952" />
          <path d="M22 34 Q40 28 58 34" stroke="#FEF3C7" strokeWidth="4" fill="none" opacity="0.65" />
          <path d="M24 47 Q40 52 56 46" stroke="#D97706" strokeWidth="3.5" fill="none" opacity="0.45" />
        </svg>
      );

    case 'mercury':
    case 'moon':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <circle
            cx="40"
            cy="40"
            r="22"
            fill={id === 'moon' ? '#CBD5E1' : '#A8A29E'}
          />
          <circle cx="32" cy="34" r="5" fill="#64748B" opacity="0.48" />
          <circle cx="47" cy="44" r="6" fill="#64748B" opacity="0.42" />
          <circle cx="44" cy="28" r="3.5" fill="#64748B" opacity="0.45" />
          <circle cx="33" cy="50" r="3.2" fill="#64748B" opacity="0.38" />
        </svg>
      );

    case 'asteroid-belt':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <polygon points="24,34 34,26 42,35 35,44 23,41" fill="#9CA3AF" />
          <polygon points="46,24 57,28 55,39 45,36" fill="#CBD5E1" />
          <polygon points="38,48 52,45 58,56 44,61 36,55" fill="#64748B" />
          <circle cx="22" cy="52" r="4.5" fill="#94A3B8" />
        </svg>
      );

    case 'halley-comet':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <path d="M28 52 L66 14 L52 38 Z" fill="#38BDF8" opacity="0.45" />
          <path d="M28 52 L60 20 L48 36 Z" fill="#BAE6FD" opacity="0.72" />
          <circle cx="27" cy="53" r="10" fill="#E0F2FE" />
          <circle cx="27" cy="53" r="6" fill="#FFFFFF" />
        </svg>
      );

    case 'voyager-probe':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <line x1="20" y1="60" x2="54" y2="26" stroke="#94A3B8" strokeWidth="3" />
          <ellipse cx="44" cy="34" rx="18" ry="8" transform="rotate(-35 44 34)" fill="#F8FAFC" />
          <circle cx="36" cy="44" r="9" fill="#FBBF24" />
          <circle cx="36" cy="44" r="4" fill="#FEF08A" />
        </svg>
      );

    case 'alpha-centauri':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="34" cy="40" r="24" fill="#FBBF24" opacity="0.22" />
          <circle cx="34" cy="40" r="15" fill="#FDE047" />
          <circle cx="53" cy="31" r="9" fill="#F59E0B" />
          <circle cx="57" cy="54" r="5" fill="#FB7185" />
        </svg>
      );

    case 'sirius-system':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="30" fill="#38BDF8" opacity="0.22" />
          <polygon points="40,10 47,33 70,40 47,47 40,70 33,47 10,40 33,33" fill="#BAE6FD" opacity="0.7" />
          <circle cx="40" cy="40" r="15" fill="#E0F2FE" />
          <circle cx="60" cy="55" r="4.5" fill="#FFFFFF" />
        </svg>
      );

    case 'trappist-1':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="31" fill="none" stroke="#FDA4AF" strokeWidth="1" opacity="0.4" />
          <circle cx="40" cy="40" r="21" fill="none" stroke="#FDA4AF" strokeWidth="1" opacity="0.45" />
          <circle cx="40" cy="40" r="13" fill="#F43F5E" />
          <circle cx="61" cy="38" r="4.5" fill="#38BDF8" />
          <circle cx="24" cy="24" r="4" fill="#C084FC" />
          <circle cx="56" cy="64" r="4.5" fill="#4ADE80" />
        </svg>
      );

    case 'kepler-haven':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="34" cy="42" r="22" fill="#F59E0B" opacity="0.24" />
          <circle cx="34" cy="42" r="14" fill="#FBBF24" />
          <circle cx="57" cy="29" r="7" fill="#22C55E" />
          <ellipse cx="57" cy="54" rx="11" ry="4" transform="rotate(-18 57 54)" fill="none" stroke="#FDE68A" strokeWidth="2.5" />
          <circle cx="57" cy="54" r="5" fill="#D97706" />
        </svg>
      );

    case 'milky-way-core':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <ellipse cx="40" cy="40" rx="34" ry="15" transform="rotate(-22 40 40)" fill="#F59E0B" opacity="0.22" />
          <path d="M12 46 Q40 16 68 34" fill="none" stroke="#38BDF8" strokeWidth="3.5" opacity="0.7" />
          <path d="M14 34 Q40 64 66 46" fill="none" stroke="#A78BFA" strokeWidth="3.5" opacity="0.7" />
          <circle cx="40" cy="40" r="11" fill="#FEF08A" />
          <circle cx="40" cy="40" r="5" fill="#FFFFFF" />
        </svg>
      );

    case 'andromeda-galaxy':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <ellipse cx="40" cy="40" rx="34" ry="14" transform="rotate(-28 40 40)" fill="#8B5CF6" opacity="0.28" />
          <ellipse cx="40" cy="40" rx="25" ry="9" transform="rotate(-28 40 40)" fill="none" stroke="#C4B5FD" strokeWidth="2.5" opacity="0.85" />
          <ellipse cx="40" cy="40" rx="16" ry="5.5" transform="rotate(-28 40 40)" fill="#38BDF8" opacity="0.55" />
          <circle cx="40" cy="40" r="7.5" fill="#FEF9C3" />
        </svg>
      );

    case 'whirlpool-galaxy':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="28" fill="#EC4899" opacity="0.16" />
          <path d="M40 40 C52 24 66 34 58 50 C48 66 22 62 18 42 C15 24 34 14 52 20" fill="none" stroke="#F472B6" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M40 40 C28 56 14 46 22 30 C32 14 58 18 62 38" fill="none" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
          <circle cx="40" cy="40" r="7" fill="#FEF08A" />
          <circle cx="62" cy="22" r="5" fill="#FDE68A" opacity="0.85" />
        </svg>
      );

    default:
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="22" fill="#38BDF8" />
        </svg>
      );
  }
}
