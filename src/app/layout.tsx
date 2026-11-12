import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Minh Quân & Thu Hà · Thiệp Cưới Online',
  description: 'Trân trọng kính mời bạn đến chung vui cùng Minh Quân & Thu Hà.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Great+Vibes&display=swap" rel="stylesheet" />
      </head>
      <body className="flex min-h-full flex-col bg-[#FBF8F2] text-[#4A4039]">{children}</body>
    </html>
  );
}
