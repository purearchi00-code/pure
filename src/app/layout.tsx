import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'D.A.R.I — 시민용 건축법 검토 시스템',
  description: '정보의 격차가 재앙이 되지 않도록',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
