import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DETAILS — Digital Educator Talent, Achievement & Identity Library System",
    template: "%s | DITAILS SMK Telkom Malang",
  },
  description:
    "Platform identitas digital guru SMK Telkom Malang. Temukan profil profesional, kompetensi, sertifikasi, dan portofolio guru terbaik.",
  keywords: [
    "SMK Telkom Malang",
    "guru SMK",
    "Profil Guru",
    "profil guru",
    "sertifikasi guru",
    "DETAILS",
  ],
  authors: [{ name: "SMK Telkom Malang" }],
  creator: "SMK Telkom Malang",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "DETAILS — SMK Telkom Malang",
    title: "DETAILS — Digital Educator Talent, Achievement & Identity Library System",
    description:
      "Platform identitas digital guru SMK Telkom Malang. Temukan profil profesional, kompetensi, sertifikasi, dan portofolio guru terbaik.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DETAILS — SMK Telkom Malang",
    description: "Platform identitas digital guru SMK Telkom Malang.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-dark-950 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#111d35",
              border: "1px solid #1e3a5f",
              color: "#f8fafc",
            },
          }}
        />
      </body>
    </html>
  );
}
