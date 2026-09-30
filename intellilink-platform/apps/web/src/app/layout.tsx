import './globals.css';
import { Providers } from '../providers';

export const metadata = {
  title: 'V-Monitor (IntelliLink OS) — Enterprise SD-WAN & SASE NOC',
  description: 'Centralized multi-tenant control plane for enterprise connectivity infrastructure.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-[#0B0F17] text-slate-200 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
