interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16", 
    lg: "w-24 h-24"
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin`} />
      {message && (
        <p className="text-cyber-cyan font-orbitron mt-4">{message}</p>
      )}
    </div>
  );
}
