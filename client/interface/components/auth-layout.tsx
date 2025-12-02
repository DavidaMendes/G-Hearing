import type React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  logoVariant?: "orange" | "teal" | "blue" | "pink";
}

export function AuthLayout({
  children,
  title,
  subtitle,
  logoVariant = "orange",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-card p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center"></div>
          <div className="space-y-2">
            <h1
              className={`text-3xl font-bold text-globo-${logoVariant}-gradient`}
            >
              G-hearing
            </h1>
            <p className="text-muted-foreground text-balance">{subtitle}</p>
          </div>
        </div>

        {children}

        <div className="text-center text-xs text-muted-foreground">
          <p>© 2025 Globo. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
