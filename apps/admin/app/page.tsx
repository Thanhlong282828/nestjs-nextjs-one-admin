'use client';

import { useState } from 'react';
import { Activity, ArrowRight, BarChart3, Bell, Boxes, ChevronDown, CircleHelp, ClipboardList, Database, LayoutDashboard, Menu, MoreHorizontal, Package, Settings2, ShoppingBag, Truck, Users, X } from 'lucide-react';
import Hrm from './components/hrm';

const navigation = [
  { title: 'KHÔNG GIAN LÀM VIỆC', items: [[LayoutDashboard, 'Tổng quan'], [Activity, 'Phân tích'], [ClipboardList, 'Công việc']] },
  { title: 'VẬN HÀNH', items: [[ShoppingBag, 'Bán hàng'], [Package, 'Kho hàng'], [Truck, 'Mua hàng'], [Users, 'Nhân sự']] },
  { title: 'HỆ THỐNG', items: [[Settings2, 'Cài đặt'], [CircleHelp, 'Trung tâm trợ giúp']] },
] as const;
const metrics = [
  { label: 'DOANH THU THÁNG', icon: BarChart3 },
  { label: 'ĐƠN HÀNG ĐANG MỞ', icon: ShoppingBag },
  { label: 'SẢN PHẨM TRONG KHO', icon: Boxes },
  { label: 'CẦN XỬ LÝ', icon: ClipboardList },
];

export default function Home() {
  const [section, setSection] = useState<'Tổng quan' | 'Nhân sự'>('Tổng quan');
  const [mobile, setMobile] = useState(false);
  const [notice, setNotice] = useState('');
  return <div className="shell">
    <aside className={`sidebar ${mobile ? 'shown' : ''}`}>
      <div className="brand"><span className="brandmark">✦</span><div><strong>aurum<span>.</span></strong><small>BUSINESS SUITE</small></div><button className="close" onClick={() => setMobile(false)} aria-label="Đóng menu"><X size={19}/></button></div>
      <div className="workspace"><div className="workspace-icon">A</div><div><strong>Aurum Workspace</strong><small>Chưa chọn công ty</small></div><ChevronDown size={15}/></div>
      <nav aria-label="Điều hướng chính">{navigation.map(group => <div className="navgroup" key={group.title}><div className="navtitle">{group.title}</div>{group.items.map(([Icon, label]) => <button key={label} className={`navitem ${label === section ? 'active' : ''}`} onClick={() => { setMobile(false); if (label === 'Tổng quan' || label === 'Nhân sự') { setSection(label); setNotice(''); } else setNotice(`${label} đang được phát triển.`); }}><Icon size={17}/><span>{label}</span></button>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-spark">✧</div><strong>Mọi thứ trong tầm tay.</strong><p>Không gian điều hành cho doanh nghiệp của bạn.</p><button onClick={() => setNotice('Hướng dẫn đang được phát triển.')}>Khám phá Aurum <ArrowRight size={13}/></button></div><div className="profile"><div className="avatar">A</div><div><strong>Aurum</strong><small>Chưa đăng nhập</small></div><MoreHorizontal size={18}/></div></div>
    </aside>
    <main className="main"><header className="topbar"><button className="menu" onClick={() => setMobile(true)} aria-label="Mở menu"><Menu size={21}/></button><div className="breadcrumb">Không gian làm việc <span>/</span> <strong>{section}</strong></div><div className="top-actions"><span className="demo-badge">CHƯA KẾT NỐI DỮ LIỆU</span><button className="icon-button" onClick={() => setNotice('Thông báo chưa được kết nối.')} aria-label="Thông báo"><Bell size={19}/></button><span className="divider"/><div className="avatar small">A</div><span className="top-name">Chưa đăng nhập</span></div></header>
      <div className="content">{notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Đóng"><X size={16}/></button></div>}</div>
      {section === 'Nhân sự' ? <Hrm/> : <div className="content dashboard-empty">
        <div className="welcome"><div><div className="eyebrow"><span className="eyebrow-dot"/> TỔNG QUAN DOANH NGHIỆP</div><h1>Không gian <em>điều hành</em> <span>✳</span></h1><p>Theo dõi hoạt động doanh nghiệp của bạn trong một nơi.</p></div></div>
        <div className="data-notice" role="status"><Database size={19}/><div><strong>Chưa thể hiển thị dữ liệu</strong><p>Đăng nhập, phân quyền và kết nối dữ liệu doanh nghiệp đang được triển khai.</p></div></div>
        <div className="section-heading"><div><span className="section-index">01 / TỔNG QUAN</span><h2>Bức tranh doanh nghiệp <span>✦</span></h2><p>Chỉ số sẽ hiển thị khi nguồn dữ liệu sẵn sàng.</p></div></div>
        <section className="metrics" aria-label="Chỉ số tổng quan">{metrics.map(({label, icon: Icon}, index) => <article className="metric" key={label}><div className="metric-top"><span>{label}</span><div className={`metric-icon icon-${index}`}><Icon size={18}/></div></div><div className="metric-value" aria-label="Chưa có dữ liệu">—</div><div className="metric-foot">Chưa kết nối dữ liệu</div></article>)}</section>
        <div className="dashboard-grid"><section className="panel"><div className="overline">HIỆU SUẤT KINH DOANH</div><h3>Doanh thu theo thời gian</h3><p>Xu hướng doanh thu sẽ hiển thị tại đây.</p><div className="data-empty"><BarChart3 size={24}/><strong>Chưa có dữ liệu để hiển thị</strong><span>Kết nối nguồn dữ liệu doanh nghiệp để xem biểu đồ.</span></div></section><section className="panel"><div className="overline">CẦN BẠN QUAN TÂM</div><h3>Việc cần xử lý</h3><p>Theo dõi các tác vụ cần quan tâm.</p><div className="data-empty"><ClipboardList size={24}/><strong>Chưa có thông tin</strong><span>Danh sách công việc chưa được kết nối.</span></div></section></div>
        <div className="bottom-grid"><section className="panel"><div className="overline">SUPPLY · INBOUND</div><h3>Đơn mua hàng gần đây</h3><div className="data-empty compact"><Package size={23}/><strong>Chưa có dữ liệu</strong><span>Đơn mua hàng chưa được kết nối.</span></div></section><section className="panel"><div className="overline">INVENTORY · AVAILABILITY</div><h3>Tình trạng kho</h3><div className="data-empty compact"><Boxes size={23}/><strong>Chưa có dữ liệu</strong><span>Thông tin kho chưa được kết nối.</span></div></section></div>
        <footer><span>© Aurum Business Suite <span className="footer-dot">·</span> Được thiết kế cho những điều lớn lao.</span><span>Chưa kết nối dữ liệu</span></footer>
      </div>}
    </main>
  </div>;
}
