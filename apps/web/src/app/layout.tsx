import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AppFooter } from '@/components/app-footer';
const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
  title: 'CareNest',
  description: 'Thoughtful senior resident care management',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
          <AppFooter />
        </Providers>
      </body>
    </html>
  );
}
