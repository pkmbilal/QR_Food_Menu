import { Suspense } from "react";
import VerifyClient from "./VerifyClient";

export const dynamic = "force-dynamic"; // ✅ prevents prerender/static export behavior for this route

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyClient />
    </Suspense>
  );
}
