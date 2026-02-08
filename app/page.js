// import FavoriteButton from '@/components/FavoriteButton'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import RestaurantCard from '@/components/restaurant/RestaurantCard'

import { QrCode, NotebookPen, ArrowLeftRight, Pizza } from 'lucide-react'

export default async function HomePage() {
  // Fetch active restaurants
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="text-center">
            {/* Badge */}
            {/* <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-gray-700">Trusted by {restaurants?.length || 0}+ restaurants</span>
            </div> */}

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Digital Menus Made
              <span className="block bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Simple & Smart
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              No app downloads. No wait times. Just scan, browse, and order via WhatsApp.
              Transform your restaurant experience today.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/auth/signup"
                className="bg-[#00c951] hover:bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Start Free Trial
              </Link>
              <Link
                href="/restaurants"
                className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all border-2 border-gray-200"
              >
                Browse Restaurants
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <QrCode size={92} color="#00c951" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">1. Scan QR Code</h3>
              <p className="text-gray-600">
                Customers scan the QR code at your table with their phone camera. No app needed!
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <NotebookPen size={92} color="#00c951" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">2. Browse Menu</h3>
              <p className="text-gray-600">
                Beautiful digital menu with photos, descriptions, and prices. Add items to cart.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <ArrowLeftRight size={92} color="#00c951" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">3. Order Instantly</h3>
              <p className="text-gray-600">
                Order sent directly to restaurant via WhatsApp. Quick, simple, contactless!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurant Owner CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Own a Restaurant?
          </h2>
          <p className="text-xl md:text-2xl text-white mb-8">
            Join our platform and start accepting orders in minutes. No setup fees, no commitments.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/auth/signup"
              className="bg-white text-primary hover:text-green-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">0</div>
              <div className="text-white">Setup Fee</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5min</div>
              <div className="text-white">To Launch</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-white">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-black py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Pizza size={36} color="#00c951" strokeWidth={2.5}/>
                <span className="text-2xl font-bold text-primary">QR Menu</span>
              </div>
              <p className="text-gray-700">
                Making restaurant ordering simple, fast, and contactless.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-700">
                <li><Link href="/auth/signup" className="hover:text-primary transition-colors">Sign Up</Link></li>
                <li><Link href="/auth/login" className="hover:text-primary transition-colors">Sign In</Link></li>
                <li><Link href="/restaurants" className="hover:text-primary transition-colors">Restaurants</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-700">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-400 pt-8 text-center text-gray-700">
            <p>&copy; 2026 QR Menu System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 