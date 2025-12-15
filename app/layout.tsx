import { type ReactNode } from 'react';

/**
 * Root layout shell.
 * The actual layout content is in app/[locale]/layout.tsx.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}
