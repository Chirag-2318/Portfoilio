import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Caveat, Instrument_Serif } from "next/font/google";
import { site, isPlaceholder } from "@/content/site";
import { getSocials } from "@/lib/socials";
import { getAssets } from "@/lib/assets";
import { Providers } from "@/components/shell/Providers";
import { AppShell } from "@/components/shell/AppShell";
import { SoundEffects } from "@/components/sound/sound-effects";
import "./globals.css";

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const siteDescription =
  "Chirag Patil is a second-year engineering student and developer in Pune. Backends, Android apps and hackathon builds.";

export const metadata: Metadata = {
  title: {
    default: "Chirag Patil",
    template: "%s — Chirag Patil",
  },
  description: siteDescription,
  metadataBase: new URL(site.url),
  openGraph: {
    type: "website",
    siteName: site.name.full,
    locale: "en_IN",
    title: "Chirag Patil",
    description: siteDescription,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  authors: [{ name: site.name.full }],
  creator: site.name.full,
  ...(isPlaceholder(site.url) ? {} : { alternates: { canonical: "./" } }),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

// Anti-flash theme script: runs before React hydration
const themeScript = `
(function(){
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'light' ? 'light' : 'dark';
    if (stored !== 'light' && stored !== 'dark') {
      try { localStorage.setItem('theme', 'dark'); } catch(e){}
    }
    document.documentElement.classList.remove('dark','light','blueprint');
    document.documentElement.classList.add(theme);
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      className={`${GeistSans.variable} ${GeistMono.variable} ${caveat.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="antialiased">
        <Providers assets={assets}>
          <SoundEffects>
            <AppShell>{children}</AppShell>
          </SoundEffects>
        </Providers>
      </body>
    </html>
  );
}
