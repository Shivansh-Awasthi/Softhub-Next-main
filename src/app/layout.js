import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SidebarWrapper from './components/Sidebar/SidebarWrapper';
import GlobalHeader from './components/GlobalHeader/page';
import { LoadingProvider } from './context/LoadingContext';
import ClientScrollProgressBar from './components/ClientScrollProgressBar';
import UserDataSynchronizer from './components/UserDataSynchronizer';
import SecurityRestrictions from './components/Restrict/SecurityRestrictions';
import SnowEffect from './components/SnowEffect';
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ToxicGames - Download Free Games and Software",
  description: "Download free games and software for Mac, PC, Android, PS2, PS3, PS4, and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
        suppressHydrationWarning={true}
      >
        <SnowEffect count={70} startAfterSidebar={true} />
        <ClientScrollProgressBar />
        {/* <UserDataSynchronizer /> */}
        {/* <SecurityRestrictions /> */}
        <div className="flex min-h-screen">
          <SidebarWrapper />
          <div className="flex-1 w-full transition-all duration-300">
            <div className="container mx-auto px-4">
              <div className="mt-8 mb-4">
                <Suspense fallback={<div className="w-full h-12 bg-[#242424] rounded-lg animate-pulse"></div>}>
                  <GlobalHeader />
                </Suspense>
              </div>
              <div className="relative">
                <Suspense fallback={<div>Loading content...</div>}>
                  <LoadingProvider>
                    {children}
                  </LoadingProvider>
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
