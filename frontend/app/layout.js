import 'react-day-picker/style.css';
import './globals.css';
import { Space_Grotesk, Fraunces } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
});

import { ClientProvider } from '../components/ClientProvider';

export const metadata = {
  title: 'HRMS Attendance',
  description: 'Attendance management frontend paired with the Express API.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${fraunces.variable}`}>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}