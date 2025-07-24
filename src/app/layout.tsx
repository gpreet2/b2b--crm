"use client"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Layout } from "@/components/layout/Layout";
import dynamic from 'next/dynamic';

// Dynamically import AuthProvider to prevent SSR issues
const AuthProvider = dynamic(
  () => import('@/lib/auth-context').then(mod => ({ default: mod.AuthProvider })),
  { ssr: false }
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Layout
            headerProps={{
              user: {
                name: "John Doe",
                email: "john@example.com"
              },
              notifications: 5
            }}
          >
            {children}
          </Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
