
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'BYOD Compliance Tracker',
  description: 'BYOD Compliance Tracker Form',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {siteKey && (
          <Script 
            src={`https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`}
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
