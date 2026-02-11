"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function OwnerTablesQrTab({
  restaurant,
  tables,
  tablesLoading,
  tableCount,
  setTableCount,
  generatingTables,
  onGenerateTables,
  onRefreshTables,
}) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied ✅");
    } catch {
      alert("Copy failed (browser blocked clipboard).");
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>Tables & QR Codes</CardTitle>
        <CardDescription>
          Generate table QR codes so orders automatically show “Table 5”.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="text-sm font-semibold">Number of tables</label>
            <input
              type="number"
              min={1}
              max={200}
              value={tableCount}
              onChange={(e) => setTableCount(e.target.value)}
              className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm"
              placeholder="e.g. 10"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              This creates missing tables (1..N). Existing ones won’t be duplicated.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={onGenerateTables} disabled={generatingTables}>
              {generatingTables ? "Generating..." : "Generate Tables"}
            </Button>
            <Button variant="outline" onClick={onRefreshTables} disabled={tablesLoading}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Online link (no table) */}
        <div className="rounded-xl border bg-background p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Online ordering link</p>
              <p className="text-sm text-muted-foreground truncate">
                {baseUrl}/menu/{restaurant.slug}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => copy(`${baseUrl}/menu/${restaurant.slug}`)}
            >
              Copy link
            </Button>
          </div>
        </div>

        {/* Tables list */}
        <div className="rounded-xl border bg-background overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <p className="font-semibold">Table QRs</p>
            <Badge variant="secondary">{tables.length} tables</Badge>
          </div>

          {tablesLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading tables…</div>
          ) : tables.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No tables yet. Click <b>Generate Tables</b>.
            </div>
          ) : (
            <div className="divide-y">
              {tables.map((t) => {
                const url = `${baseUrl}/menu/${restaurant.slug}?t=${encodeURIComponent(
                  t.code
                )}`;

                return (
                  <div
                    key={t.id}
                    className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">Table {t.table_number}</p>
                        <Badge variant={t.is_active ? "default" : "secondary"}>
                          {t.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{url}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => copy(url)}>
                        Copy link
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Next step: add a “Download QR Pack (PDF)” button to print all tables in one click.
        </p>
      </CardContent>
    </Card>
  );
}
