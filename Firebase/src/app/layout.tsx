
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import Image from 'next/image';
import Link from 'next/link';
import { AccessibilityProvider } from '@/components/accessibility/accessibility-provider';
import AccessibilityToolbar from '@/components/accessibility/accessibility-toolbar';
import ClientOnly from '@/components/client-only';

export const metadata: Metadata = {
  title: 'RAR Application Form',
  description: "LCA Teignbridge's formal \"Read, Apply, Review\" (RAR) process for BYOD usage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
          <header className="container mx-auto flex justify-center py-6">
            <Link href="/">
              <Image
                  src="https://citizensadviceteignbridge.org.uk/wp-content/uploads/2016/02/presentation_blue_Teignbridge.png"
                  alt="Citizens Advice Teignbridge Logo"
                  width={800}
                  height={200}
                  priority
                  style={{ width: '300px', height: 'auto' }}
                />
            </Link>
          </header>
          <ClientOnly>
            <AccessibilityProvider>
              <AccessibilityToolbar />
              <Toaster />
            </AccessibilityProvider>
          </ClientOnly>
          <main>{children}</main>
      </body>
    </html>
  );
}
