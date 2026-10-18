import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Interview Buddy', description: 'Company-specific product manager interview preparation' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body style={{fontFamily:'system-ui, sans-serif',maxWidth:980,margin:'40px auto',padding:'0 20px',lineHeight:1.6}}>{children}</body></html>}
