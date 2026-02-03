import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import RegisterServiceWorker from './register-sw'
import NotificationChecker from './notification-checker'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GoalRemind - Gestionnaire de rappels et objectifs',
  description: 'Une application PWA pour gérer vos rappels et objectifs',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GoalRemind',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <RegisterServiceWorker />
        <NotificationChecker />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
