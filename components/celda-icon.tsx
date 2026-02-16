export const CeldaIcon = ({ className = "w-4 h-6" }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 22"
        className={className}
        style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', flexShrink: 0 }}
    >
        <path d="M6 0 h4 v2 h2 v2 h2 v16 h-2 v1 h-8 v-1 h-2 v-16 h2 v-2 h2 z" fill="#1A1A1A" />
        <rect x="7" y="1" width="2" height="1" fill="#FBBF24" />
        <rect x="5" y="3" width="1" height="1" fill="#FDE047" />
        <rect x="6" y="3" width="4" height="1" fill="#FBBF24" />
        <rect x="10" y="3" width="1" height="1" fill="#D97706" />
        <rect x="3" y="5" width="2" height="15" fill="#FDE047" />
        <rect x="5" y="5" width="6" height="15" fill="#FBBF24" />
        <rect x="11" y="5" width="2" height="15" fill="#D97706" />
        <rect x="3" y="10" width="10" height="1" fill="#1A1A1A" />
        <rect x="7" y="6" width="2" height="3" fill="#1A1A1A" />
        <rect x="6" y="7" width="4" height="1" fill="#1A1A1A" />
        <rect x="3" y="5" width="1" height="1" fill="#FFFFFF" />
        <rect x="5" y="3" width="1" height="1" fill="#FFFFFF" />
    </svg>
);
