import Link from "next/link"
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Clock3,
  ArrowRight,
  BadgeCheck,
  Headphones,
  Store,
} from "lucide-react"

import SiteFooter from "@/components/home/SiteFooter"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { footerData } from "@/lib/siteData"

export const metadata = {
  title: "Contact Us | ScanEat",
  description:
    "Contact ScanEat for QR menu setup, WhatsApp ordering, onboarding support, and digital menu solutions for restaurants across Saudi Arabia.",
  keywords: [
    "ScanEat contact",
    "QR menu Saudi Arabia",
    "WhatsApp ordering KSA",
    "digital menu support",
    "restaurant QR menu contact",
  ],
}

export default function ContactPage() {
  const phone = "+966531826230"
  const displayPhone = "+966 531826230"

  const whatsappNumber = "+966543831060"
  const displayWhatsapp = "+966 543831060"
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\+/g, "")}`

  const email = "sales@scaneatksa.com"

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-primary/10 bg-[radial-gradient(circle_at_top_left,rgba(0,201,81,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(0,201,81,0.10),transparent_28%),linear-gradient(to_bottom,hsl(var(--background)),hsl(var(--background))_55%)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-60px] top-[-40px] h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute right-[-40px] top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-[-80px] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur">
              <BadgeCheck className="h-4 w-4" />
              Contact ScanEat
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
              Let’s bring your restaurant menu online
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              Need a digital QR menu, WhatsApp ordering setup, or help onboarding your
              restaurant? Our team is here to help you launch faster and serve customers better.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-primary px-7 text-primary-foreground shadow-lg hover:bg-primary/90"
              >
                <Link href={whatsappLink} target="_blank">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat on WhatsApp
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-primary/20 bg-background px-7 hover:bg-primary/5"
              >
                <Link href={`mailto:${email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Sales
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
              <div className="rounded-full border border-border bg-background/80 px-4 py-2 shadow-sm">
                QR Menus for Restaurants
              </div>
              <div className="rounded-full border border-border bg-background/80 px-4 py-2 shadow-sm">
                WhatsApp Ordering
              </div>
              <div className="rounded-full border border-border bg-background/80 px-4 py-2 shadow-sm">
                Onboarding Support Across KSA
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick highlights */}
      <section className="container mx-auto px-4 py-8 md:py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">For restaurants & cafes</p>
                <p className="text-sm text-muted-foreground">
                  Perfect for dine-in, takeaway, and WhatsApp orders
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Fast support</p>
                <p className="text-sm text-muted-foreground">
                  Reach us directly for setup, questions, and demos
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Simple onboarding</p>
                <p className="text-sm text-muted-foreground">
                  Launch your digital menu quickly with ScanEat
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="container mx-auto px-4 py-8 md:py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="group overflow-hidden rounded-3xl border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Phone className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-semibold">Call us</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Speak directly with our team for pricing, onboarding, and platform guidance.
              </p>

              <Link
                href={`tel:${phone}`}
                className="mt-5 inline-flex items-center text-sm font-medium text-primary hover:opacity-80"
              >
                {displayPhone}
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </CardContent>
          </Card>

          <Card className="group overflow-hidden rounded-3xl border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-semibold">Email us</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Send us your inquiry anytime and we’ll get back to you with the right solution.
              </p>

              <Link
                href={`mailto:${email}`}
                className="mt-5 inline-flex items-center break-all text-sm font-medium text-primary hover:opacity-80"
              >
                {email}
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </CardContent>
          </Card>

          <Card className="group overflow-hidden rounded-3xl border-primary/20 bg-gradient-to-br from-primary/10 to-background shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <MessageCircle className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-semibold">WhatsApp</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                The fastest way to reach us for demos, quick questions, and restaurant setup help.
              </p>

              <Link
                href={whatsappLink}
                target="_blank"
                className="mt-5 inline-flex items-center text-sm font-medium text-primary hover:opacity-80"
              >
                {displayWhatsapp}
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main content */}
      <section className="container mx-auto px-4 pb-16 pt-4 md:pb-24">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.15fr]">
          <div className="space-y-6">
            <Card className="rounded-[28px] border-border bg-card shadow-sm">
              <CardContent className="p-7 md:p-8">
                <h2 className="text-2xl font-semibold tracking-tight">Get in touch</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  ScanEat helps restaurants, cafes, and food businesses modernize their customer
                  experience with QR menus and WhatsApp ordering. Whether you need a demo,
                  onboarding help, or want to discuss pricing, we’d love to hear from you.
                </p>

                <div className="mt-8 space-y-5">
                  <div className="flex items-start gap-4 rounded-2xl bg-muted/50 p-4">
                    <div className="rounded-xl bg-background p-2.5 shadow-sm">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <Link
                        href={`tel:${phone}`}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {displayPhone}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl bg-muted/50 p-4">
                    <div className="rounded-xl bg-background p-2.5 shadow-sm">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">WhatsApp</p>
                      <Link
                        href={whatsappLink}
                        target="_blank"
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {displayWhatsapp}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl bg-muted/50 p-4">
                    <div className="rounded-xl bg-background p-2.5 shadow-sm">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <Link
                        href={`mailto:${email}`}
                        className="break-all text-sm text-muted-foreground hover:text-foreground"
                      >
                        {email}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl bg-muted/50 p-4">
                    <div className="rounded-xl bg-background p-2.5 shadow-sm">
                      <Clock3 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Availability</p>
                      <p className="text-sm text-muted-foreground">
                        Sunday to Thursday — 9:00 AM to 6:00 PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl bg-muted/50 p-4">
                    <div className="rounded-xl bg-background p-2.5 shadow-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Service area</p>
                      <p className="text-sm text-muted-foreground">
                        Supporting restaurants across Saudi Arabia
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-[28px] border border-primary/20 bg-primary p-7 text-primary-foreground shadow-lg">
              <p className="text-sm font-medium text-primary-foreground/80">
                Need a faster response?
              </p>
              <h3 className="mt-2 text-2xl font-semibold">Message us on WhatsApp</h3>
              <p className="mt-3 text-sm leading-7 text-primary-foreground/85">
                For quick inquiries, demos, and onboarding support, WhatsApp is the fastest way to
                reach the ScanEat team.
              </p>

              <Button
                asChild
                size="lg"
                className="mt-6 rounded-full bg-background px-6 text-primary hover:bg-background/90"
              >
                <Link href={whatsappLink} target="_blank">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Start WhatsApp Chat
                </Link>
              </Button>
            </div>
          </div>

          <Card className="rounded-[28px] border-border bg-card shadow-sm">
            <CardContent className="p-7 md:p-9">
              <div className="mb-8">
                <p className="text-sm font-medium text-primary">Send us a message</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Tell us about your restaurant
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Share your restaurant name, what you need, and how you'd like ScanEat to help.
                  We’ll get back to you as soon as possible.
                </p>
              </div>

              <form className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      className="w-full rounded-2xl border border-border bg-muted/40 px-4 py-3.5 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:bg-background"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      placeholder="Your phone number"
                      className="w-full rounded-2xl border border-border bg-muted/40 px-4 py-3.5 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-border bg-muted/40 px-4 py-3.5 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:bg-background"
                  />
                </div>

                <div>
                  <label htmlFor="business" className="mb-2 block text-sm font-medium">
                    Restaurant / Business Name
                  </label>
                  <input
                    id="business"
                    name="business"
                    type="text"
                    placeholder="Your restaurant or business name"
                    className="w-full rounded-2xl border border-border bg-muted/40 px-4 py-3.5 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:bg-background"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={7}
                    placeholder="Tell us about your restaurant, branch count, and what you need from ScanEat..."
                    className="w-full rounded-2xl border border-border bg-muted/40 px-4 py-3.5 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:bg-background"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button
                    type="submit"
                    size="lg"
                    className="rounded-full bg-primary px-7 text-primary-foreground hover:bg-primary/90"
                  >
                    Send Message
                  </Button>

                  <Button
                    asChild
                    type="button"
                    variant="outline"
                    size="lg"
                    className="rounded-full border-primary/20 px-7 hover:bg-primary/5"
                  >
                    <Link href={whatsappLink} target="_blank">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Contact via WhatsApp
                    </Link>
                  </Button>
                </div>

                <p className="text-xs leading-6 text-muted-foreground">
                  This form is currently UI only. You can connect it next to Supabase, Resend, or
                  Formspree.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <SiteFooter data={footerData} />
    </main>
  )
}