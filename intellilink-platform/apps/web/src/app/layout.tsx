import './globals.css';
import { Providers } from '../providers';

export const metadata = {
  title: 'Intellilink NOG — Network Operations & Governance Platform',
  description: 'Centralized multi-tenant control plane for enterprise connectivity infrastructure.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0F17] text-slate-200 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
