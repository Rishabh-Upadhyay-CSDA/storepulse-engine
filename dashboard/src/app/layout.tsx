import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StorePulse | Real-time Price Tracker",
  description: "Track price drops and market trends in real time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
    >
      <html lang="en" className="h-full">
        <body
          className={`${inter.className} flex min-h-screen flex-col bg-slate-950 text-slate-100 antialiased selection:bg-blue-500 selection:text-white`}
        >
          {/* Subtle Ambient Background Gradient Glows */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
          </div>

          {/* Main Content Area */}
          <main className="flex-1">{children}</main>

          {/* Dashboard Footer */}
          <footer className="border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                
                {/* Brand & Tagline */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                    SP
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-sm font-bold text-transparent">
                      StorePulse
                    </span>
                    <p className="text-xs text-slate-500">
                      Automated real-time e-commerce price monitoring.
                    </p>
                  </div>
                </div>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-400">
                  <span className="rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-1">Next.js 14</span>
                  <span className="rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-1">Neon PostgreSQL</span>
                  <span className="rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-1">Clerk</span>
                  <span className="rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-1">Tailwind CSS</span>
                </div>

                {/* Status Indicator & Copyright */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                    <span className="text-slate-400">Systems Operational</span>
                  </div>
                  <span>•</span>
                  <span>© {new Date().getFullYear()} StorePulse</span>
                </div>

              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}