import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Hurricane Helene Response Map",
  description: "Interactive map for coordinating hurricane response efforts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="bg-blue-600 text-white p-4">
            <h1 className="text-2xl font-bold">Hurricane Helene Response Map</h1>
          </header>
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
