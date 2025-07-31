"use client"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Layout } from "@/components/layout/Layout";
import { LocationProvider, useLocation } from "@/contexts/LocationContext";
import { LocationSwitchLoader } from "@/components/ui/LocationSwitchLoader";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const isOnboardingPage = pathname?.startsWith('/onboarding');
  
  const user = {
    name: 'Admin User',
    email: 'admin@fitnesspro.com'
  };

  if (isAuthPage || isOnboardingPage) {
    return children;
  }

  return (
    <LocationProvider>
      <LocationAwareLayout user={user}>
        {children}
      </LocationAwareLayout>
    </LocationProvider>
  );
}

function LocationAwareLayout({ 
  children, 
  user 
}: { 
  children: React.ReactNode;
  user: { name: string; email: string };
}) {
  const { isLocationSwitching, selectedLocation } = useLocation();

  return (
    <>
      <Layout
        headerProps={{
          user,
          notifications: 5
        }}
        className={isLocationSwitching ? "location-switching" : ""}
      >
        <div 
          key={selectedLocation} 
          className={`location-content-wrapper ${!isLocationSwitching ? 'location-content-fade-in' : ''}`}
        >
          {children}
        </div>
      </Layout>
      <LocationSwitchLoader 
        isVisible={isLocationSwitching} 
        locationName={selectedLocation}
      />
    </>
  );
}

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
        <AppContent>{children}</AppContent>
      </body>
    </html>
  );
}
