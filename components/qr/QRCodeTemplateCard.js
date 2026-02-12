'use client'

import { forwardRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Pizza, QrCode } from 'lucide-react'

const QRCodeTemplateCard = forwardRef(function QRCodeTemplateCard(
  { selectedTableId, selectedTable, qrCodeUrl },
  ref
) {
  const showTable = selectedTableId !== 'general' && selectedTable?.table_number

  return (
    <div
      ref={ref}
      // ✅ exact physical size for print/export
      // style={{ width: '8cm', height: '11cm' }}
      className="bg-white"
    >
      <Card className="h-full w-full border-border shadow-none rounded-xl">
        <CardContent className="h-full py-4 px-8 flex flex-col items-center justify-between">
          {/* Header */}
          <div className="w-full flex items-center justify-center gap-2 pt-1 mb-3">
              <Pizza className="h-8 w-8 text-primary" />
            <div className="leading-tight text-center">
              <p className="text-3xl font-bold tracking-tight text-primary">
                ScanEat
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-2">
            <p className="text-md font-semibold text-gray-400 leading-none">
              Scan to Order
            </p>
          </div>

          {/* QR */}
          <div className="flex-1 flex items-center justify-center mb-2">
            <div className="rounded-xl border border-border bg-white p-2">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="object-contain"
                  style={{ width: '5.8cm', height: '5.8cm' }} // ✅ nice fit
                />
              ) : (
                <div
                  className="flex items-center justify-center text-xs text-muted-foreground"
                  style={{ width: '5.8cm', height: '5.8cm' }}
                >
                  Generating...
                </div>
              )}
            </div>
          </div>

          {/* Table (only if selected) */}
          <div className="pb-1 text-center">
            {showTable ? (
              <p className="text-md  font-semibold text-foreground">
                Table {selectedTable.table_number}
              </p>
            ) : (
              <div className="h-[20px]" /> // keeps spacing consistent
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

export default QRCodeTemplateCard
