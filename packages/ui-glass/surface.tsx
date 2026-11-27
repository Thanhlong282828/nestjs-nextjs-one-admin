import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type SurfaceProps = ComponentPropsWithoutRef<'div'>;
export function GlassSurface({ className = '', ...props }: SurfaceProps) {
  return <div className={`glass-surface ${className}`} {...props}/>;
}
export function GlassCard({ className = '', ...props }: ComponentPropsWithoutRef<'article'>) {
  return <article className={`glass-surface ${className}`} {...props}/>;
}
export function GlassHeader({ className = '', ...props }: ComponentPropsWithoutRef<'header'>) {
  return <header className={`glass-surface ${className}`} {...props}/>;
}
export function GlassSidebar({ className = '', ...props }: ComponentPropsWithoutRef<'aside'>) {
  return <aside className={`glass-surface ${className}`} {...props}/>;
}
export function AmbientGlow({ className = '' }: { className?: string }) {
  return <span className={className} aria-hidden="true"/>;
}
export function GlassNotification({ children }: { children: ReactNode }) {
  return <div className="glass-surface glass-notification" role="status">{children}</div>;
}
