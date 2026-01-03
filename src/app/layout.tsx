import { Roboto_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'
import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { auth } from '@/auth'
import { Toaster } from '@/components/ui/sonner'

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Cascade',
  description:
    'Wallet-native subscriptions powered by ERC-7715. Autonomous agent management with safety bounds.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  return (
    <html lang='en' className='dark' suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${robotoMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          disableTransitionOnChange
        >
          <SessionProvider session={session}>{children}</SessionProvider>
          <Toaster closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
