import Link from "next/link";
import Image from "next/image";

export default function SiteFooter({ data }) {
  return (
    <footer className="border-t border-slate-200 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <Image src="/logo.svg" alt="ScanEat Logo" width={180} height={50}/>
            </div>

            <p className="max-w-md leading-7 text-slate-600">{data.description}</p>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-slate-900">Quick Links</h3>
            <ul className="space-y-3 text-slate-600">
              {data.productLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition hover:text-emerald-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold text-slate-900">Company</h3>
            <ul className="space-y-3 text-slate-600">
              {data.companyLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition hover:text-emerald-600">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
          {data.copyright}
        </div>
      </div>
    </footer>
  );
}