import './globals.css'
import { CartProvider } from './CartContext'
import LayoutWithNavbar from '@/components/LayoutWithNavbar'

export const metadata = {
  title: 'QR Menu System',
  description: 'Digital menu for restaurants',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <CartProvider>
          <LayoutWithNavbar>
            {children}
          </LayoutWithNavbar>
        </CartProvider>
      </body>
    </html>
  )
}