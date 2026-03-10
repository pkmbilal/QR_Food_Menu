import {
  ScanLine,
  NotebookPen,
  MessageCircleMore,
  Smartphone,
  Languages,
  Store,
  Clock3,
  Wallet,
  BadgeCheck,
  QrCode,
  ArrowLeftRight,
  CircleHelp,
  Star,
} from "lucide-react";

export const heroData = {
  badge: "Smart QR menus for modern restaurants",
  title: "Professional QR Menu & Ordering System for",
  highlight: "Restaurants, Cafes & Food Brands",
  description:
    "Let customers scan, browse your menu, and place orders instantly. No app downloads. No printed menu hassle. Just a faster, cleaner, more modern restaurant experience.",
  primaryCta: {
    label: "Start Free Trial",
    href: "/auth/signup",
  },
  secondaryCta: {
    label: "Explore Restaurants",
    href: "/restaurants",
  },
  points: ["No app required", "Launch in minutes", "WhatsApp-friendly workflow"],
};

export const trustStripData = {
  eyebrow: "Built for modern hospitality",
  title: "Everything your restaurant needs to go digital with QR menus",
  stats: [
    { value: "0", label: "Setup Fee" },
    { value: "5 min", label: "To Launch" },
    { value: "24/7", label: "Support" },
  ],
};

export const howItWorksData = {
  eyebrow: "How it works",
  title: "Get started in 3 simple steps",
  description:
    "A smooth ordering experience for customers and a simple workflow for restaurant owners.",
  steps: [
    {
      icon: QrCode,
      title: "1. Scan QR Code",
      description:
        "Customers scan the QR code using their phone camera and instantly open your menu.",
    },
    {
      icon: NotebookPen,
      title: "2. Browse the Menu",
      description:
        "Guests view items, prices, photos, and descriptions on a clean mobile-first menu.",
    },
    {
      icon: ArrowLeftRight,
      title: "3. Order Instantly",
      description:
        "Orders are sent directly through WhatsApp for quick, familiar, low-friction ordering.",
    },
  ],
};

export const featuresData = {
  eyebrow: "Core features",
  title: "Everything needed for a modern QR menu system",
  description:
    "Built to help restaurants launch faster, update menus easily, and serve customers better.",
  items: [
    {
      icon: ScanLine,
      title: "QR Code Per Table",
      description:
        "Generate unique QR codes for every table so customers can scan and start ordering instantly.",
    },
    {
      icon: NotebookPen,
      title: "Live Menu Updates",
      description:
        "Change prices, items, photos, and availability anytime without reprinting physical menus.",
    },
    {
      icon: MessageCircleMore,
      title: "WhatsApp Ordering",
      description:
        "Orders are sent directly through WhatsApp for a fast and familiar workflow.",
    },
    {
      icon: Smartphone,
      title: "Mobile-First Experience",
      description:
        "Menus are designed for phones first, with a smooth browsing and ordering experience.",
    },
    {
      icon: Languages,
      title: "Multi-Language Ready",
      description:
        "Serve local and international customers with multilingual digital menus.",
    },
    {
      icon: Store,
      title: "Built for Restaurants",
      description:
        "Perfect for cafes, restaurants, bakeries, food trucks, and dine-in table ordering.",
    },
  ],
};

export const benefitsData = {
  eyebrow: "Why restaurants choose ScanEat",
  title: "Designed to reduce friction and improve service",
  description:
    "ScanEat helps restaurants modernize menu access, reduce manual effort, and create a cleaner customer journey from table scan to completed order.",
  items: [
    {
      icon: Clock3,
      title: "Faster Service",
      text: "Guests browse and order without waiting for printed menus or staff availability.",
    },
    {
      icon: Wallet,
      title: "Lower Costs",
      text: "No recurring printing costs for menu updates, promotions, or seasonal changes.",
    },
    {
      icon: BadgeCheck,
      title: "More Professional",
      text: "Give your restaurant a clean, modern, branded digital ordering experience.",
    },
  ],
  panel: {
    title: "What owners care about",
    subtitle: "Restaurant success snapshot",
    stats: [
      { value: "Instant", text: "Menu access through QR scan" },
      { value: "Easy", text: "Manage items and pricing anytime" },
      { value: "Direct", text: "WhatsApp-based order flow" },
      { value: "Modern", text: "Professional digital experience" },
    ],
  },
};

export const featuredRestaurantsData = {
  eyebrow: "Featured restaurants",
  title: "Discover live restaurants using ScanEat",
  description:
    "Browse a few active restaurants and see how digital menus can look in the real world.",
  cta: {
    label: "View all restaurants",
    href: "/restaurants",
  },
  emptyState: {
    title: "No restaurants yet",
    description: "Be the first to join the platform and launch your digital menu.",
  },
};

export const faqData = {
  eyebrow: "FAQ",
  title: "Common questions from restaurant owners",
  icon: CircleHelp,
  items: [
    {
      q: "Do customers need to install an app?",
      a: "No. Customers simply scan the QR code using their phone camera and the menu opens in the browser.",
    },
    {
      q: "Can I update my menu anytime?",
      a: "Yes. You can edit items, prices, photos, and availability at any time from your dashboard.",
    },
    {
      q: "Can each table have its own QR code?",
      a: "Yes. You can generate QR codes for individual tables so orders can be associated more accurately.",
    },
    {
      q: "How long does setup take?",
      a: "Most restaurants can get started in minutes by creating an account, adding menu items, and generating QR codes.",
    },
    {
      q: "Is this suitable for small restaurants and cafes?",
      a: "Yes. ScanEat is ideal for cafes, restaurants, bakeries, and small food businesses that want a simple digital menu workflow.",
    },
  ],
};

export const finalCtaData = {
  icon: Star,
  title: "Ready to launch your restaurant QR menu?",
  description:
    "Start free, create your menu, generate QR codes, and give your customers a faster dining experience in just a few minutes.",
  primaryCta: {
    label: "Get Started Free",
    href: "/auth/signup",
  },
  secondaryCta: {
    label: "Browse Restaurants",
    href: "/restaurants",
  },
};

export const footerData = {
  brandName: "ScanEat",
  description:
    "ScanEat helps restaurants create professional digital menus and simple QR ordering experiences without the friction of traditional systems.",
  productLinks: [
    { label: "Restaurants", href: "/restaurants" },
    { label: "Sign Up", href: "/auth/signup" },
    { label: "Sign In", href: "/auth/login" },
  ],
  companyLinks: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],
  copyright: "© 2026 ScanEat. All rights reserved.",
};