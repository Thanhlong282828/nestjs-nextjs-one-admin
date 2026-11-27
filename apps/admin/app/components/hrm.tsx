import { adminCatalog } from '../../../../packages/i18n/src/admin';
import type { Locale } from '../../../../packages/i18n/src';
import HrmLive from './hrm-live';

export default function Hrm({ locale }: { locale: Locale }) {
  const t = adminCatalog[locale];
  return <div className="content hrm-page">
    <div className="hrm-breadcrumb">{t.operations} <span>/</span> {t.hr} <span>/</span> {t.overview}</div>
    <div className="hrm-heading"><div><div className="hrm-kicker"><span/> {t.peopleCulture} <span className="hrm-kicker-line"/> {t.hrSpace}</div><h1>{t.hrTitle} <em>{t.hrTitleEm}</em></h1><p>{t.hrIntro}</p></div></div>
    <HrmLive locale={locale}/>
  </div>;
}
