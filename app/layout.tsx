import './globals.css';
import Providers from './providers';

export const metadata = { title: 'Ownly Mint' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
