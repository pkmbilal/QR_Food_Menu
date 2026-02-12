'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode'
import Link from 'next/link'
import {
  Download,
  Printer,
  ExternalLink,
  QrCode,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'

// ✅ NEW: export DOM -> PNG
import { toPng } from 'html-to-image'

// ✅ NEW: template component
import QRCodeTemplateCard from '@/components/qr/QRCodeTemplateCard'

export default function QRCodeClientPage({ restaurantSlug }) {
  const router = useRouter()
  const slug = decodeURIComponent(String(restaurantSlug || '')).trim()

  const [restaurant, setRestaurant] = useState(null)

  // ✅ your table token is restaurant_tables.code
  const [tables, setTables] = useState([]) // {id, table_number, code}
  const [selectedTableId, setSelectedTableId] = useState('general') // "general" or table.id

  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [menuUrl, setMenuUrl] = useState('')

  const [loading, setLoading] = useState(true)
  const [roleChecked, setRoleChecked] = useState(false)

  // ✅ NEW: ref to the printable/downloadable template
  const templateRef = useRef(null)

  const selectedTable = useMemo(() => {
    if (selectedTableId === 'general') return null
    return tables.find((t) => t.id === selectedTableId) || null
  }, [selectedTableId, tables])

  // ✅ Build the URL exactly like your existing table QR system: ?t=<code>
  const encodedUrl = useMemo(() => {
    if (!slug) return ''
    if (typeof window === 'undefined') return ''

    const base = `${window.location.origin}/menu/${slug}`

    if (!selectedTable) return base

    // code is the token you already use in your system
    if (selectedTable.code) {
      return `${base}?t=${encodeURIComponent(selectedTable.code)}`
    }

    // fallback only if code missing (shouldn't happen)
    return `${base}?table=${encodeURIComponent(selectedTable.table_number)}`
  }, [slug, selectedTable])

  useEffect(() => {
    let mounted = true

    async function guardAndLoad() {
      try {
        if (!slug) {
          toast.error('Missing restaurant slug.')
          router.push('/dashboard')
          return
        }

        if (mounted) {
          setLoading(true)
          setRoleChecked(false)
        }

        // 1) Logged-in user
        const { data: userRes } = await supabase.auth.getUser()
        const user = userRes?.user

        if (!user) {
          toast.error('Please login first.')
          router.push('/auth/login')
          return
        }

        // 2) Role check (✅ your table is user_profiles)
        const { data: profile, error: profErr } = await supabase
          .from('user_profiles')
          .select('id, role')
          .eq('id', user.id)
          .maybeSingle()

        if (profErr) console.log('user_profiles error:', profErr)

        const role = String(profile?.role || '').toLowerCase()
        const isAdmin = role === 'admin'
        const isOwner = role === 'owner'

        if (!isAdmin && !isOwner) {
          toast.error(`Access denied. Your role: ${role || '(missing)'}`)
          router.push('/dashboard')
          return
        }

        // 3) Fetch restaurant by slug
        const { data: rest, error: restErr } = await supabase
          .from('restaurants')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()

        if (restErr) console.log('restaurants error:', restErr)

        if (!rest) {
          toast.error(`Restaurant not found: ${slug}`)
          router.push('/dashboard')
          return
        }

        // 4) Ownership check (admin bypass)
        if (!isAdmin) {
          const uid = user.id
          const email = (user.email || '').toLowerCase().trim()
          const ownerId = rest.owner_id
          const ownerEmail = (rest.owner_email || '').toLowerCase().trim()

          const ownerEmailMatch = ownerEmail && email && ownerEmail === email

          // Optional claim owner_id if missing but email matches
          if (!ownerId && ownerEmailMatch) {
            const { error: claimErr } = await supabase
              .from('restaurants')
              .update({ owner_id: uid })
              .eq('id', rest.id)

            if (claimErr) {
              console.log('owner_id claim error:', claimErr)
              toast.warning('Owner matched by email, but failed to store owner_id.')
            } else {
              rest.owner_id = uid
              toast.success('Restaurant linked to your owner account ✅')
            }
          }

          const finalOwnerOk =
            (rest.owner_id && rest.owner_id === uid) || ownerEmailMatch

          if (!finalOwnerOk) {
            toast.error("You don't own this restaurant.")
            router.push('/dashboard/owner')
            return
          }
        }

        if (mounted) setRestaurant(rest)

        // 5) Fetch tables with the actual token column: code ✅
        const { data: tableRows, error: tableErr } = await supabase
          .from('restaurant_tables')
          .select('id, table_number, code, is_active')
          .eq('restaurant_id', rest.id)
          .order('table_number', { ascending: true })

        if (tableErr) {
          console.log('restaurant_tables error:', tableErr)
          if (mounted) setTables([])
        } else {
          const activeTables = (tableRows || []).filter((t) => t.is_active !== false)
          if (mounted) setTables(activeTables)
        }
      } catch (e) {
        console.error(e)
        toast.error('Something went wrong.')
        router.push('/dashboard')
      } finally {
        if (mounted) {
          setRoleChecked(true)
          setLoading(false)
        }
      }
    }

    guardAndLoad()
    return () => {
      mounted = false
    }
  }, [slug, router])

  // Generate QR whenever encodedUrl changes
  useEffect(() => {
    let mounted = true

    async function generate() {
      if (!encodedUrl) return
      setMenuUrl(encodedUrl)

      try {
        const qr = await QRCode.toDataURL(encodedUrl, {
          width: 1000,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
        })
        if (mounted) setQrCodeUrl(qr)
      } catch (err) {
        console.error('QR error:', err)
        toast.error('Failed to generate QR code.')
      }
    }

    generate()
    return () => {
      mounted = false
    }
  }, [encodedUrl])

  // ✅ Download the TEMPLATE (not the QR image)
  const handleDownloadTemplate = async () => {
    try {
      if (!templateRef.current) return
      if (!qrCodeUrl) {
        toast.error('QR not ready yet.')
        return
      }

      const suffix =
        selectedTableId === 'general'
          ? 'menu'
          : `table-${String(selectedTable?.table_number ?? 'x')}`

      // turn component into PNG
      const dataUrl = await toPng(templateRef.current, {
        cacheBust: true,
        pixelRatio: 2, // crisp
        backgroundColor: '#ffffff',
      })

      const a = document.createElement('a')
      a.download = `${slug}-${suffix}-template.png`
      a.href = dataUrl
      a.click()

      toast.success('Template downloaded ✅')
    } catch (e) {
      console.error(e)
      toast.error('Failed to download template.')
    }
  }

  // ✅ Print only the template (CSS hides everything else)
  const handlePrint = () => window.print()

  if (loading || !roleChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Preparing QR Template...</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="max-w-md w-full border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <span className="text-2xl">⚠️</span> Restaurant Not Found
            </CardTitle>
            <CardDescription>
              We couldn&apos;t load the restaurant &quot;{slug}&quot;.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      {/* SCREEN UI */}
      <div className="max-w-4xl mx-auto space-y-8 no-print">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            QR Code Template Generator
          </h1>
          <p className="text-muted-foreground">
            Download or print a professional QR template (logo + instructions + QR).
            Choose a table to generate a table-specific QR.
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-2xl flex items-center gap-2">
              <QrCode className="h-6 w-6 text-primary" />
              {restaurant.name}
            </CardTitle>
            <CardDescription>
              {selectedTableId === 'general'
                ? 'Universal menu QR'
                : `Table-specific QR for Table ${selectedTable?.table_number}`}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            <div className="w-full flex items-center justify-center space-y-2">
              <div className='md:w-1/2 w-full'>
                <label className="text-sm font-medium text-foreground">QR Type</label>

                <select
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                >
                  <option value="general">General Menu QR</option>

                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      Table {t.table_number}
                    </option>
                  ))}
                </select>
              </div>

              {tables.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No tables found. Create tables first to generate table QR codes.
                </p>
              )}
            </div>

            {/* ✅ Template preview */}
            <div className="flex justify-center">
              <div className="rounded-xl bg-white p-4 overflow-auto max-w-full">
                <QRCodeTemplateCard
                  ref={templateRef}
                  restaurant={restaurant}
                  selectedTableId={selectedTableId}
                  selectedTable={selectedTable}
                  qrCodeUrl={qrCodeUrl}
                  menuUrl={menuUrl}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center md:pt-4 pb-8">
            <Button
              onClick={handleDownloadTemplate}
              className="w-full sm:w-auto gap-2"
              size="lg"
              disabled={!qrCodeUrl}
            >
              <Download className="h-4 w-4" />
              Download Template PNG
            </Button>

            <Button
              onClick={handlePrint}
              variant="outline"
              className="w-full sm:w-auto gap-2"
              size="lg"
              disabled={!qrCodeUrl}
            >
              <Printer className="h-4 w-4" />
              Print Template
            </Button>

            <Button asChild variant="secondary" className="w-full sm:w-auto gap-2" size="lg">
              <Link href={menuUrl || `/menu/${slug}`} target="_blank">
                <ExternalLink className="h-4 w-4" />
                Preview Menu
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* PRINT-ONLY AREA */}
      <div className="hidden print:block print-only">
        <div className="min-h-screen flex items-center justify-center p-10 bg-white">
          <QRCodeTemplateCard
            restaurant={restaurant}
            selectedTableId={selectedTableId}
            selectedTable={selectedTable}
            qrCodeUrl={qrCodeUrl}
            menuUrl={menuUrl}
          />
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 12mm;
            size: A4;
          }
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}