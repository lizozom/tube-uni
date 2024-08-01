import type { Metadata } from 'next'
import { Young_Serif } from 'next/font/google'
import './globals.css'

import { Analytics } from '@vercel/analytics/react'
import { inject } from '@vercel/analytics'

inject({ mode: process.env.VERCEL_ENV === 'development' ? 'development' : 'production' })

const youngSerif = Young_Serif({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'tube uni',
  description: 'do something useful with your commute, dummy',
  metadataBase: new URL('https://tubeuni.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tubeuni.app',
    siteName: 'tube uni',
    images: {
      url: 'https://tubeuni.app/og-image.png',
      width: 1200,
      height: 630,
      alt: 'tube uni'
    }
  }
}

export default function RootLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      </head>
      <body className={youngSerif.className}>
        <div className="page-wrapper real-100vh">
        {children}
        <Analytics/>
        </div>
        </body>
    </html>
  )
}
