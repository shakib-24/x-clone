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
      <body className="min-h-full bg-[#000000] text-[#e7e9ea]">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#16181c",
              color: "#e7e9ea",
              border: "1px solid #2f3336",
            },
          }}
        />
      </body>
    </html>
  );
}
