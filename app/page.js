export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🍕 QR Menu System
        </h1>
        <p className="text-gray-600 mb-8">
          Scan QR code to view restaurant menu
        </p>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-sm text-gray-500">
            System is ready! Menu pages will load at:
          </p>
          <code className="text-orange-600 font-mono">
            /menu/[restaurant-slug]
          </code>
        </div>
      </div>
    </div>
  )
}