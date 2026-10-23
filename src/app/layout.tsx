import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Interview Breakthrough', description: 'Company-specific product manager interview preparation', icons: {icon: '/interview-buddy-logo.svg', apple: '/interview-buddy-logo.svg'} };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
