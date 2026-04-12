import type { Metadata } from 'next';
import { Lexend, JetBrains_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const sansFont = Lexend({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Baymax · Hệ Thống Phân Tích Chi Phí AI',
  description: 'Nền tảng tra cứu và phân loại chi phí ngân sách thông minh sử dụng AI. Tối ưu quy trình hạch toán kế toán.',
  keywords: 'tra cứu chi phí, AI analysis, expense protocol, ngân sách nhà nước',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${sansFont.variable} ${monoFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh] bg-background text-foreground" suppressHydrationWarning>
        {children}
        <Toaster richColors position="bottom-right" theme="light" />
      </body>
    </html>
  );
}
