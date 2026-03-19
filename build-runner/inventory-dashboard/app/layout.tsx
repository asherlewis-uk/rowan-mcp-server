import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Repository Dashboard',
  description: 'Professional GitHub repository management dashboard with portfolio KPIs, filtering, details, and editing flows.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
