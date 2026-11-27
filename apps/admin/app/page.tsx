'use client';
import { Suspense, useRef, useState } from 'react';
import { Activity, ArrowRight, BarChart3, Bell, Boxes, ChevronDown, CircleHelp, ClipboardList, Database, LayoutDashboard, Menu, MoreHorizontal, Package, Settings2, ShoppingBag, Truck, Users, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ThemeToggle } from '../../../packages/ui-glass/theme-toggle';
import { LanguageSwitcher, useLocalePreference } from '../../../packages/ui-glass/locale';
import { GlassCard, GlassCommandPalette, GlassDropdown, GlassSidebar } from '../../../packages/ui-glass/components';
import { adminCatalog } from '../../../packages/i18n/src/admin';
const Hrm = dynamic(() => import('./components/hrm'));

export default function Home() {
  const { locale, change } = useLocalePreference();
  const t = adminCatalog[locale];
  const [section, setSection] = useState<'overview' | 'hr'>('overview');
  const [mobile, setMobile] = useState(false);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const [notice, setNotice] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const navigation = [
    { title:t.workspace, items:[[LayoutDashboard,t.overview,'overview'],[Activity,t.analytics,''],[ClipboardList,t.tasks,'']] },
    { title:t.operations, items:[[ShoppingBag,t.sales,''],[Package,t.warehouse,''],[Truck,t.purchasing,''],[Users,t.hr,'hr']] },
    { title:t.system, items:[[Settings2,t.settings,''],[CircleHelp,t.help,'']] },
  ] as const;
  const metrics = [{label:t.revenue,icon:BarChart3},{label:t.orders,icon:ShoppingBag},{label:t.stock,icon:Boxes},{label:t.pending,icon:ClipboardList}];
  return <div className="shell">
    <GlassSidebar className={`sidebar ${mobile ? 'shown' : ''}`} onKeyDown={event => { if (event.key === 'Escape' && mobile) { setMobile(false); menuTrigger.current?.focus(); } }}>
      <div className="brand"><span className="brandmark">✦</span><div><strong>aurum<span>.</span></strong><small>BUSINESS SUITE</small></div><button className="close" onClick={() => setMobile(false)} aria-label={t.closeMenu}><X size={19}/></button></div>
      <div className="workspace"><div className="workspace-icon">A</div><div><strong>Aurum Workspace</strong><small>{t.companyMissing}</small></div><ChevronDown size={15}/></div><div className="workspace scope-status"><div><strong>{t.branch}</strong><small>{t.branchMissing}</small></div></div>
      <nav aria-label={t.nav}>{navigation.map(group => <div className="navgroup" key={group.title}><div className="navtitle">{group.title}</div>{group.items.map(([Icon,label,target]) => <button key={label} className={`navitem ${target && target === section ? 'active' : ''}`} onClick={() => { setMobile(false); if (target === 'overview' || target === 'hr') { setSection(target); setNotice(''); } else setNotice(`${label} ${t.developing}`); }}><Icon size={17}/><span>{label}</span></button>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-spark">✧</div><strong>{t.helpTitle}</strong><p>{t.helpText}</p><button onClick={() => setNotice(t.helpPending)}>{t.discover} <ArrowRight size={13}/></button></div><div className="profile"><div className="avatar">A</div><div><strong>Aurum</strong><small>{t.signedOut}</small></div><MoreHorizontal size={18}/></div></div>
    </GlassSidebar>
    <main className="main"><header className="topbar"><button ref={menuTrigger} className="menu" onClick={() => setMobile(true)} aria-label={t.openMenu} aria-expanded={mobile}><Menu size={21}/></button><div className="breadcrumb">{t.workspaceName} <span>/</span> <strong>{section === 'hr' ? t.hr : t.overview}</strong></div><div className="top-actions"><button className="search-trigger" aria-label={t.search} type="button" onClick={event => { event.currentTarget.focus(); setSearchOpen(true); }}>⌕ <span>{t.search}</span></button><LanguageSwitcher locale={locale} onChange={next => { change(next); setNotice(''); }}/><ThemeToggle locale={locale}/><span className="demo-badge">{t.dataDisconnected}</span><GlassDropdown label={t.scope}><strong>{t.companies}</strong><p>{t.scopePending}</p></GlassDropdown><button className="icon-button" onClick={() => setNotice(t.notificationsPending)} aria-label={t.notifications}><Bell size={19}/></button><span className="divider"/><div className="avatar small">A</div><span className="top-name">{t.signedOut}</span></div></header>
      <div className="content">{notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label={t.close}><X size={16}/></button></div>}</div>
      {section === 'hr' ? <Suspense fallback={<div className="content" role="status">{t.hrLoading}</div>}><Hrm locale={locale}/></Suspense> : <div className="content dashboard-empty">
        <div className="welcome"><div><div className="eyebrow"><span className="eyebrow-dot"/> {t.summary}</div><h1>{t.title} <em>{t.titleEm}</em> <span>✳</span></h1><p>{t.intro}</p></div></div>
        <div className="data-notice" role="status"><Database size={19}/><div><strong>{t.unavailable}</strong><p>{t.unavailableDesc}</p></div></div>
        <div className="section-heading"><div><span className="section-index">{t.overviewIndex}</span><h2>{t.businessView} <span>✦</span></h2><p>{t.metricDesc}</p></div></div>
        <section className="metrics" aria-label={t.metrics}>{metrics.map(({label,icon:Icon},index) => <GlassCard className="metric" key={label}><div className="metric-top"><span>{label}</span><div className={`metric-icon icon-${index}`}><Icon size={18}/></div></div><div className="metric-value" aria-label={t.noData}>—</div><div className="metric-foot">{t.disconnected}</div></GlassCard>)}</section>
        <div className="dashboard-grid"><section className="panel glass-surface"><div className="overline">{t.performance}</div><h3>{t.revenueChart}</h3><p>{t.revenueDesc}</p><div className="data-empty" role="status"><strong>{t.chartEmpty}</strong><span>{t.chartConnect}</span></div></section><section className="panel glass-surface"><div className="overline">{t.attention}</div><h3>{t.work}</h3><p>{t.workDesc}</p><div className="data-empty"><ClipboardList size={24}/><strong>{t.noInfo}</strong><span>{t.tasksMissing}</span></div></section></div>
        <div className="bottom-grid"><section className="panel glass-surface"><div className="overline">{t.supplyInbound}</div><h3>{t.purchaseRecent}</h3><div className="data-empty compact"><Package size={23}/><strong>{t.noData}</strong><span>{t.purchaseMissing}</span></div></section><section className="panel glass-surface"><div className="overline">{t.inventoryAvailability}</div><h3>{t.stockStatus}</h3><div className="data-empty compact"><Boxes size={23}/><strong>{t.noData}</strong><span>{t.stockMissing}</span></div></section></div>
        <section className="analytics-section" aria-labelledby="analytics-title"><div className="section-heading"><div><span className="section-index">{t.analyticsIndex}</span><h2 id="analytics-title">{t.businessOps}</h2><p>{t.reportsMissing}</p></div><button type="button" className="scope-disabled" disabled>{t.datesMissing}</button></div><div className="analytics-grid">{[t.sales,t.purchasing,t.hr,t.finance,t.operationalPerformance,t.comparison].map(title => <GlassCard key={title} className="analytics-card"><div className="overline">{t.analytics}</div><h3>{title}</h3><p>{t.disconnected}</p><span aria-label={t.noData}>—</span></GlassCard>)}</div></section>
        <footer><span>© Aurum Business Suite <span className="footer-dot">·</span> {t.footer}</span><span>{t.disconnected}</span></footer>
      </div>}
    </main>
    <GlassCommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} locale={locale} commands={[{label:t.overview,action:()=>setSection('overview')},{label:t.hr,action:()=>setSection('hr')}]}/>
  </div>;
}
