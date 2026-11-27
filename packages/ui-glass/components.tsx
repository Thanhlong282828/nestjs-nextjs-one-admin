'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { adminCatalog } from '../i18n/src/admin';
import { translate, type Locale } from '../i18n/src';

export { AmbientGlow, GlassCard, GlassHeader, GlassNotification, GlassSidebar, GlassSurface } from './surface';

type DialogProps = { open: boolean; title: string; onClose: () => void; children: ReactNode; locale?: Locale };
export function GlassDialog({ open, title, onClose, children, locale = 'vi' }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} className="glass-dialog" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} onClose={() => { if (open) onClose(); }} onKeyDown={event => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')).filter(element => element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }}>
    <div className="glass-dialog-header"><h2 id={titleId}>{title}</h2><button className="glass-dismiss" type="button" onClick={onClose} aria-label={adminCatalog[locale].close}>✕</button></div>{children}
  </dialog>;
}
export const GlassModal = GlassDialog;

type Command = { label: string; action: () => void };
export function GlassCommandPalette({ open, onClose, commands, locale = 'vi' }: { open: boolean; onClose: () => void; commands: Command[]; locale?: Locale }) {
  const [search, setSearch] = useState('');
  const searchId = useId();
  const t = adminCatalog[locale];
  const matches = commands.filter(command => command.label.toLocaleLowerCase(locale).includes(search.trim().toLocaleLowerCase(locale)));
  return <GlassDialog open={open} onClose={onClose} title={t.search} locale={locale}><p>{t.searchDesc}</p><label htmlFor={searchId}>{t.searchLabel}</label><input id={searchId} type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={t.searchPlaceholder}/><ul className="glass-action-list">{matches.map(command => <li key={command.label}><button type="button" onClick={() => { command.action(); onClose(); setSearch(''); }}>{command.label}</button></li>)}</ul>{matches.length === 0 && <p role="status">{t.searchEmpty}</p>}</GlassDialog>;
}

type DataState = ({ status: 'loading' } | { status: 'empty'; message: string } | { status: 'error'; message: string } | { status: 'ready'; children: ReactNode }) & { locale?: Locale };
export function GlassDataState(props: DataState) {
  if (props.status === 'ready') return <>{props.children}</>;
  const locale = props.locale ?? 'vi';
  if (props.status === 'loading') return <div className="data-empty" role="status">{translate(locale, 'common.loading')}</div>;
  return <div className="data-empty" role={props.status === 'error' ? 'alert' : 'status'}><strong>{translate(locale, props.status === 'error' ? 'common.loadError' : 'common.empty')}</strong><span>{props.message}</span></div>;
}

export function GlassPopover({ label, children }: { label: string; children: ReactNode }) {
  return <details className="glass-popover" onKeyDown={event => {
    if (event.key === 'Escape' && event.currentTarget.open) {
      event.preventDefault();
      event.currentTarget.open = false;
      event.currentTarget.querySelector('summary')?.focus();
    }
  }}><summary>{label}</summary><div className="glass-popover-content glass-surface">{children}</div></details>;
}
export function GlassDropdown({ label, children }: { label: string; children: ReactNode }) {
  return <GlassPopover label={label}>{children}</GlassPopover>;
}
