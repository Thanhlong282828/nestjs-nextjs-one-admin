'use client';
import { useEffect, useState } from 'react';

export function ThemeToggle({ locale = 'vi' }: { locale?: 'vi' | 'en' }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = window.localStorage.getItem('aurum-theme');
    const next = saved === 'dark' || (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    setDark(next);
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    window.localStorage.setItem('aurum-theme', next ? 'dark' : 'light');
  }
  const label = locale === 'vi' ? (dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối') : (dark ? 'Switch to light theme' : 'Switch to dark theme');
  const text = locale === 'vi' ? (dark ? 'Sáng' : 'Tối') : (dark ? 'Light' : 'Dark');
  return <button type="button" className="theme-toggle glass-surface" onClick={toggle} aria-label={label}>{dark ? '☀' : '☾'} <span>{text}</span></button>;
}
