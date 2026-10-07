import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL('https://abhiradh-portfolio.vercel.app'),alternates:{canonical:'/'},title:'Abhiradh Gorti — The Living Machine',description:'Intelligent systems. Experiences with presence. Selected work by Abhiradh Gorti, a Computer Science and Engineering student in Vizianagaram, India.',robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
