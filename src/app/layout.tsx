import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { site, isPlaceholder } from "@/content/site";
import { getSocials } from "@/lib/socials";
import { getAssets } from "@/lib/assets";
import { Providers } from "@/components/shell/Providers";
import { AppShell } from "@/components/shell/AppShell";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const siteDescription =
  "Chirag Patil is a second-year engineering student and developer in Pune. Backends, Android apps and hackathon builds.";

export const metadata: Metadata = {
  title: {
    default: "Chirag Patil — Developer in Pune",
    template: "%s — Chirag Patil",
  },
  description: siteDescription,
  metadataBase: new URL(site.url),
  openGraph: {
    type: "website",
    siteName: site.name.full,
    locale: "en_IN",
    title: "Chirag Patil — Developer in Pune",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  authors: [{ name: site.name.full }],
  creator: site.name.full,
  ...(isPlaceholder(site.url) ? {} : { alternates: { canonical: "./" } }),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3F0E8" },
    { media: "(prefers-color-scheme: dark)", color: "#12110E" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const assets = getAssets();
  const visibleSocials = getSocials()
    .filter((s) => !s.placeholder && !isPlaceholder(s.url))
    .map((s) => s.url);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name.full,
    ...(isPlaceholder(site.url) ? {} : { url: site.url }),
    jobTitle: "Student and software developer",
    email: `mailto:${site.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location.city,
      addressRegion: site.location.region,
      addressCountry: "IN",
    },
    alumniOf: site.education.map((edu) => ({
      "@type": "CollegeOrUniversity",
      name: edu.institution,
    })),
    knowsAbout: site.skills.flatMap((s) => s.items),
    ...(visibleSocials.length > 0 ? { sameAs: visibleSocials } : {}),
    ...(assets.hasPhoto && !isPlaceholder(site.url)
      ? { image: `${site.url}${site.assets.photo}` }
      : {}),
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <Providers assets={assets}>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
