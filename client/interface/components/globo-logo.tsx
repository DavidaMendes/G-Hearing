interface GloboLogoProps {
  size?: "sm" | "md" | "lg"
  variant?: "orange" | "teal" | "blue" | "pink"
}

export function GloboLogo({ size = "md", variant = "orange" }: GloboLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  const gradientClasses = {
    orange: "bg-globo-orange-gradient",
    teal: "bg-globo-teal-gradient",
    blue: "bg-globo-blue-gradient",
    pink: "bg-globo-pink-gradient",
  }

  return (
    <div
      className={`${sizeClasses[size]} ${gradientClasses[variant]} rounded-full p-2 flex items-center justify-center`}
    >
      <div className="w-full h-full bg-white rounded-sm flex items-center justify-center">
        <div className={`w-3 h-3 ${gradientClasses[variant]} rounded-full`} />
      </div>
    </div>
  )
}
