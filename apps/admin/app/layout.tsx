import type { Metadata } from 'next';
import './style.css';
export const metadata: Metadata = { title: 'Aurum | Không gian vận hành', description: 'Trung tâm điều hành doanh nghiệp Aurum ERP' };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="vi"><body>{children}</body></html>; }
