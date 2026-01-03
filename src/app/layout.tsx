import { Roboto_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    template: '%s – Cascade',
    default: 'Cascade',
  },
  description:
    'Wallet-native subscriptions powered by ERC-7715. Autonomous agent management with safety bounds.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className='dark'>
      <body
        className={`${spaceGrotesk.variable} ${robotoMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
