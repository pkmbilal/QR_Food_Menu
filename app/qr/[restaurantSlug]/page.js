'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode'
import Link from 'next/link'

export default function QRCodePage({ params }) {
  const { restaurantSlug } = use(params)
  const [restaurant, setRestaurant] = useState(null)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRestaurant() {
      // Get restaurant from database
      const { data } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', restaurantSlug)
        .single()

      if (data) {
        setRestaurant(data)
        
        // Generate QR code that links to menu page
        const menuUrl = `${window.location.origin}/menu/${restaurantSlug}`
        const qrCode = await QRCode.toDataURL(menuUrl, {
          width: 500,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        
        setQrCodeUrl(qrCode)
      }
      
      setLoading(false)
    }

    fetchRestaurant()
  }, [restaurantSlug])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = `${restaurantSlug}-qr-code.png`
    link.href = qrCodeUrl
    link.click()
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Generating QR Code...</div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Restaurant Not Found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">QR Code Generator</h1>
          <p className="text-gray-600">Scan this code to view the menu</p>
        </div>

        {/* QR Code Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{restaurant.name}</h2>
            <p className="text-gray-600">Scan to view our digital menu</p>
          </div>

          {/* QR Code Image */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-6 rounded-lg border-4 border-orange-500">
              {qrCodeUrl && (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code"
                  className="w-80 h-80"
                />
              )}
            </div>
          </div>

          {/* Menu URL */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">Or visit directly:</p>
            <code className="bg-gray-100 px-4 py-2 rounded text-sm">
              {typeof window !== 'undefined' && `${window.location.origin}/menu/${restaurantSlug}`}
            </code>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownload}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <span>⬇️</span>
              Download QR Code
            </button>
            
            <button
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <span>🖨️</span>
              Print QR Code
            </button>

            <Link
              href={`/menu/${restaurantSlug}`}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <span>👁️</span>
              Preview Menu
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">📋 How to Use:</h3>
          <ul className="space-y-2 text-blue-800">
            <li>✅ <strong>Download:</strong> Save QR code as image file</li>
            <li>✅ <strong>Print:</strong> Print and display at your restaurant</li>
            <li>✅ <strong>Share:</strong> Add to flyers, table tents, or social media</li>
            <li>✅ <strong>Customers Scan:</strong> They see your menu instantly!</li>
          </ul>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .bg-white.rounded-lg.shadow-lg.p-8 * {
            visibility: visible;
          }
          .bg-white.rounded-lg.shadow-lg.p-8 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}