import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
  title: 'TraCứu Chi Phí — Cổng Thông Tin Chính Thức',
  description: 'Hệ thống tra cứu chuyên sâu chi phí và ngân sách chính thống. Đảm bảo tính minh bạch và độ chính xác cao.',
  keywords: 'tra cứu chi phí, AI analysis, expense protocol',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${sansFont.variable} ${monoFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh] bg-background text-foreground" suppressHydrationWarning>
        <div className="relative z-10 min-h-[100dvh]">
          {children}
        </div>
        
        {/* Toast Notifications */}
        <Toaster richColors position="bottom-right" theme="light" />
      </body>
    </html>
  );
}
