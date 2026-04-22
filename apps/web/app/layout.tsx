import type { Metadata } from 'next';
import { AuthProvider } from './AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'AB Test Pro',
  description: 'Statistical A/B Testing Platform',
  viewport: 'width=device-width, initial-scale=1.0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
