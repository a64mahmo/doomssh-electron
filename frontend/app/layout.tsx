import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { ElectronProvider } from '@/components/ElectronProvider'
import { DebugToast } from '@/components/DebugToast'
import { PersistenceProvider } from '@/components/PersistenceProvider'
import { cn } from '@/lib/utils'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'DoomSSH — Resume Builder',
  description: 'Build standout resumes. No account. No server. Yours forever.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn('font-sans antialiased', geist.variable)}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <PersistenceProvider>
              <ElectronProvider />
              <DebugToast />
              {children}
            </PersistenceProvider>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
