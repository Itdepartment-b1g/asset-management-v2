import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReduxProvider } from "@/components/providers/redux-provider";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Asset Management",
  description: "Practice project with Next.js, Prisma, and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ReduxProvider>{children}</ReduxProvider>
        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            style: {
              width: "fit-content",
              maxWidth: "min(356px, calc(100vw - 2rem))",
              left: 0,
              right: 0,
              marginInline: "auto",
            },
          }}
        />

      </body>
    </html>
  );
}
