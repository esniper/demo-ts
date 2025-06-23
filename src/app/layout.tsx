import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FlagVaultProvider } from "@/contexts/FlagVaultContext";
import { Navigation } from "@/components/Navigation";
import { EnvironmentSwitcher } from "@/components/EnvironmentSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlagVault Demo - Feature Flag Management",
  description: "Interactive demo showcasing FlagVault's feature flag capabilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <FlagVaultProvider>
          <div className="flex h-screen">
            <Navigation />
            <div className="flex-1 flex flex-col overflow-hidden">
              <header className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-semibold text-gray-900">FlagVault SDK Demo</h1>
                  <EnvironmentSwitcher />
                </div>
              </header>
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </div>
          </div>
        </FlagVaultProvider>
      </body>
    </html>
  );
}
