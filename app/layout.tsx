import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sensor Dashboard - Real-time Monitoring',
  description: 'Personal sensor data monitoring and visualization dashboard',
  keywords: ['sensors', 'IoT', 'dashboard', 'real-time', 'monitoring'],
  authors: [{ name: 'Sensor Dashboard' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sensor Dashboard',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 antialiased touch-manipulation`}>
        <div className="min-h-full">
          {children}
        </div>
      </body>
    </html>
  )
} 