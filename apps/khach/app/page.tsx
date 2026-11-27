'use client';
import { ThemeToggle } from '../../../packages/ui-glass/theme-toggle';
import { GlassCard, GlassSurface } from '../../../packages/ui-glass/surface';
import { LanguageSwitcher, useLocalePreference } from '../../../packages/ui-glass/locale';
import { storefrontCatalog } from '../../../packages/i18n/src/storefront';

export default function Home() {
  const { locale, change } = useLocalePreference();
  const t = storefrontCatalog[locale];
  const services = [
    { title: t.searchTitle, description: t.searchDesc }, { title: t.detailTitle, description: t.detailDesc },
    { title: t.cartTitle, description: t.cartDesc }, { title: t.accountTitle, description: t.accountDesc },
  ];
  return <main className="shop">
    <div className="announcement">{t.announcement} <span>✦</span> {t.dedicated}</div>
    <header className="shop-header"><a className="shop-logo" href="#top" aria-label={t.home}><span>✦</span> AURUM <small>SHOP</small></a><nav aria-label={t.navigation}><a href="#discover">{t.discover}</a><a href="#products">{t.products}</a><a href="#shopping">{t.shopping}</a></nav><LanguageSwitcher locale={locale} onChange={change}/><ThemeToggle locale={locale}/></header>
    <section className="shop-hero" id="top"><div className="hero-copy"><div className="shop-eyebrow"><span/> AURUM SHOP · {t.everydayEdit}</div><h1>{t.title}<br/><em>{t.titleEm}</em></h1><p>{t.intro}</p><a className="shop-cta" href="#products">{t.explore} <span>↗</span></a><div className="hero-note"><span>✧</span><div>{t.selected}<small>{t.experience}</small></div></div></div><div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-a"/><div className="art-orbit orbit-b"/><div className="art-glow"/><div className="art-card glass-surface"><span>{t.aurumEdit}</span><strong>{t.art}<br/><i>{t.artEm}</i></strong><div className="art-mark">✦</div><small>{t.curatedLiving}</small></div><div className="art-caption">{t.beautyCaption}<br/><span>{t.everydayCaption}</span></div></div></section>
    <section className="shop-values" id="discover"><div><span>{t.inspiration}</span><strong>{t.valueTitle}</strong></div><p>{t.valueDesc}</p><span className="value-star">✳</span></section>
    <section className="products" id="products"><div className="products-heading"><div><div className="shop-eyebrow">{t.collection}</div><h2>{t.productTitle}<span>.</span></h2><p>{t.productDesc}</p></div><span className="collection-index">AURUM / SHOP</span></div><GlassSurface className="product-empty" role="status"><div className="empty-icon">✧</div><h3>{t.emptyTitle}</h3><p>{t.emptyDesc}</p><span>{t.comeBack}</span></GlassSurface></section>
    <section className="shopping-services" id="shopping" aria-labelledby="shopping-title"><div className="shop-eyebrow">{t.shopTogether}</div><h2 id="shopping-title">{t.serviceTitle}<span>.</span></h2><p>{t.serviceDesc}</p><div className="services-grid">{services.map((item,index) => <GlassCard className="service-card" key={item.title}><span>0{index + 1} / AURUM</span><h3>{item.title}</h3><p>{item.description}</p><small>{t.preparing}</small></GlassCard>)}</div></section>
    <footer className="shop-footer"><a className="shop-logo" href="#top"><span>✦</span> AURUM <small>SHOP</small></a><p>{t.footer}</p><span>© Aurum Shop</span></footer>
  </main>;
}
