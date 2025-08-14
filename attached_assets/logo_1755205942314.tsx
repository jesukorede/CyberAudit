export function CyberChariLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`rounded-lg bg-gradient-to-br from-cyan-400 to-green-400 p-0.5 ${className}`}>
      <div className="w-full h-full bg-slate-800 rounded-md flex items-center justify-center relative overflow-hidden">
        {/* Cyber shield icon */}
        <svg
          viewBox="0 0 100 100"
          className="w-6 h-6 text-cyan-400"
          fill="currentColor"
        >
          {/* Outer shield */}
          <path d="M50 10 L20 25 L20 45 C20 65 35 85 50 90 C65 85 80 65 80 45 L80 25 Z" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" />
          
          {/* Inner shield layers */}
          <path d="M50 20 L30 30 L30 45 C30 60 40 75 50 80 C60 75 70 60 70 45 L70 30 Z" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                opacity="0.7" />
          
          <path d="M50 30 L40 35 L40 45 C40 55 45 65 50 70 C55 65 60 55 60 45 L60 35 Z" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                opacity="0.5" />
          
          {/* Lock icon in center */}
          <circle cx="50" cy="50" r="3" fill="currentColor" />
          <rect x="47" y="45" width="6" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-green-400/20 rounded-md"></div>
      </div>
    </div>
  );
}
