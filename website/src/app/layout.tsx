import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Commitra — AI-Powered Commit Messages for Developers",
  description:
    "Never think about commit messages again. Commitra generates clean, accurate, conventional commits using AI — instantly.",
  keywords: [
    "commit messages",
    "AI commit generator",
    "git automation",
    "developer tools",
    "Groq AI",
    "OpenAI",
    "conventional commits",
    "CLI tools",
    "productivity tools",
    "coding workflow",
  ],
  authors: [{ name: "Commitra" }],
  creator: "Commitra",
  publisher: "Commitra",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://commitra.vercel.app/",
    siteName: "Commitra",
    title: "Commitra — AI-Powered Commit Messages for Developers",
    description:
      "Commitra writes clean, accurate commit messages using AI so developers can stay in flow and ship faster.",
    images: [
      {
        url: "/og-commitra.png",
        width: 1200,
        height: 630,
        alt: "Commitra CLI Preview",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@your_twitter_handle", // ← Replace
    creator: "@your_twitter_handle",
    title: "Commitra — AI-Powered Commit Messages",
    description:
      "Never write commit messages again. Commitra generates clean, accurate, AI-powered commits instantly.",
    images: ["/og-commitra.png"],
  },
  alternates: {
    canonical: "https://commitra.vercel.app/",
  },
  category: "developer tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        {children}
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
