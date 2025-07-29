"use client"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Layout } from "@/components/layout/Layout";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  
  const user = {
    name: 'Admin User',
    email: 'admin@fitnesspro.com'
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {isAuthPage ? (
          children
        ) : (
          <Layout
            headerProps={{
              user,
              notifications: 5
            }}
          >
            {children}
          </Layout>
        )}
      </body>
    </html>
  );
}
