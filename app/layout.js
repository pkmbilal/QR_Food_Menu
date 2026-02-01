import './globals.css'
import { CartProvider } from './CartContext'

export const metadata = {
  title: 'QR Menu System',
  description: 'Digital menu for restaurants',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}