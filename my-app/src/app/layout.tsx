import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'LWS Prisma ORM Crash Course // Developer Notebook',
  description: 'Official baseline note-taking application for mastering database relationships, schema migrations, and Server Actions in Next.js.',
  openGraph: {
    title: 'LWS Prisma ORM Crash Course',
    description: 'Step-by-step developer notebook demonstrating relational data fetching with Prisma ORM and Next.js App Router.',
    siteName: 'Learn with Sumit',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-neo-bg text-black selection:bg-neo-yellow selection:text-black">
        <main className="min-h-screen flex flex-col">{children}</main>
      </body>
    </html>
  );
}
