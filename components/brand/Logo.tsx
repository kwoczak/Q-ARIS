
export function Logo({ className = "w-8 h-8", textClassName = "text-xl" }: { className?: string, textClassName?: string }) {
    return (
        <div className="flex items-center gap-2">
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-blue-500 ${className}`}
            >
                {/* Stylized Q / Lens / QR Code feel */}
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <path d="M3.3 7 8.7 5 12 3 15.3 5 20.7 7" className="opacity-50" />
                <path d="M12 22V12" />
                <path d="m12 12 8.7-5" />
                <path d="m12 12-8.7-5" />
            </svg>
            <span className={`font-bold tracking-tight ${textClassName}`}>
                Q-ARIS
            </span>
        </div>
    )
}
