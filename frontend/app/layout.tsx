import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HireMind AI — Find Smarter. Get Hired Faster.',
  description: 'AI-powered job intelligence platform. Get matched jobs, career insights, and a personal Career Copilot to land your dream job.',
  keywords: 'AI job search, job matching, career copilot, job platform, find jobs, AI hiring',
  openGraph: {
    title: 'HireMind AI',
    description: 'AI-powered job intelligence platform. Find smarter. Get hired faster.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-animated-mesh text-zinc-900">
        {children}
      </body>
    </html>
  )
}
