import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "X Clone",
  description: "X (Twitter) Clone built with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-x-bg text-x-text">
        {/* Anti-flash theme script — runs sync before paint */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('x-theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})()` }} />
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "var(--x-surface)",
              color: "var(--x-text)",
              border: "1px solid var(--x-border)",
            },
          }}
        />
      </body>
    </html>
  );
}
