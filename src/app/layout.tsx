import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Lemonade Stand - QR Payments',
  description: 'Digital lemonade stand with QR code payments via Stripe',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-lemon-100 to-yellow-200">
          {children}
        </div>
      </body>
    </html>
  )
}