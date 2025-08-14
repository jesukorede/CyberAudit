import logoImage from "@assets/cyberchari logo BG_1755200081911.jpg";

export function CyberChariLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <img 
        src={logoImage} 
        alt="CyberChari Logo" 
        className="w-full h-full object-cover"
      />
    </div>
  );
}