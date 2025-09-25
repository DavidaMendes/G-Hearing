import type React from "react"
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';import "./globals.css"

export const metadata = {
  title: "G-hearing | Globo",
  description: "Sistema de reconhecimento de áudio com IA para identificação de músicas e trilhas sonoras",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable} antialiased dark`}>
      <body className="min-h-screen bg-background font-sans text-foreground">{children}</body>
    </html>
  )
}
