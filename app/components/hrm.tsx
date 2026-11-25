import { CalendarDays, CircleCheck, Database, Search, UserRoundCheck, Users } from 'lucide-react';

const quickStats = [
  { label: 'TỔNG NHÂN SỰ', icon: Users, tone: 'yellow' },
  { label: 'ĐANG LÀM VIỆC', icon: UserRoundCheck, tone: 'mint' },
  { label: 'NGHỈ PHÉP HÔM NAY', icon: CalendarDays, tone: 'violet' },
  { label: 'NHÂN SỰ MỚI', icon: CircleCheck, tone: 'blue' },
];

export default function Hrm() {
  return <div className="content hrm-page">
    <div className="hrm-breadcrumb">VẬN HÀNH <span>/</span> NHÂN SỰ <span>/</span> TỔNG QUAN</div>
    <div className="hrm-heading"><div><div className="hrm-kicker"><span/> PEOPLE &amp; CULTURE <span className="hrm-kicker-line"/> KHÔNG GIAN NHÂN SỰ</div><h1>Con người tạo nên <em>khác biệt.</em></h1><p>Một nơi để chăm sóc đội ngũ và đồng hành cùng sự phát triển.</p></div></div>
    <div className="data-notice" role="status"><Database size={19}/><div><strong>Dữ liệu nhân sự chưa được kết nối</strong><p>Danh sách và báo cáo sẽ hiển thị khi đăng nhập và phân quyền công ty, chi nhánh được triển khai.</p></div></div>
    <div className="hrm-section-heading"><div><span className="section-index">01 / PEOPLE OVERVIEW</span><h2>Đội ngũ của bạn <span>✦</span></h2><p>Các chỉ số lấy từ dữ liệu doanh nghiệp khi hệ thống sẵn sàng.</p></div></div>
    <section className="hrm-stats" aria-label="Chỉ số nhân sự">{quickStats.map(({label, icon: Icon, tone}) => <article className="hrm-stat" key={label}><div className="hrm-stat-top"><span>{label}</span><span className={`hrm-stat-icon ${tone}`}><Icon size={18}/></span></div><strong aria-label="Chưa có dữ liệu">—</strong><p>Chưa kết nối dữ liệu</p></article>)}</section>
    <div className="hrm-layout"><section className="hrm-directory panel"><div className="directory-heading"><div><div className="overline">PEOPLE DIRECTORY</div><h2>Danh sách nhân viên</h2><p>Quản lý và kết nối với những người trong tổ chức.</p></div></div><div className="data-empty"><Search size={24}/><strong>Chưa thể tải danh sách</strong><span>Kết nối dữ liệu và quyền truy cập chưa sẵn sàng.</span></div></section><aside className="hrm-side"><div className="people-card"><div className="people-card-top"><span>✳</span><span>YOUR PEOPLE MATTER</span></div><div className="people-orbits"><div className="orbit-center">✦</div></div><h3>Đội ngũ vững mạnh,<br/><em>doanh nghiệp vươn xa.</em></h3><p>Mỗi thành viên đều là một phần quan trọng trong hành trình phát triển.</p></div><div className="hrm-activity panel"><div className="overline">CẦN CHÚ Ý</div><h3>Hoạt động gần đây</h3><div className="data-empty compact"><strong>Chưa có thông tin</strong><span>Hoạt động nhân sự chưa được kết nối.</span></div></div></aside></div>
    <section className="insights" aria-labelledby="insights-title"><div className="insights-heading"><div><div className="section-index">02 / PEOPLE INTELLIGENCE</div><h2 id="insights-title">Góc nhìn tổ chức <span>✦</span></h2><p>Phân tích nhân sự theo công ty và chi nhánh.</p></div></div><div className="insights-grid">{['Hành trình phát triển', 'Cơ cấu phòng ban', 'Mạng lưới chi nhánh'].map(title => <article className="panel" key={title}><h3>{title}</h3><div className="data-empty compact"><strong>Chưa có dữ liệu để hiển thị</strong><span>Biểu đồ sẽ sẵn sàng khi dữ liệu được kết nối.</span></div></article>)}</div></section>
    <footer><span>© Aurum Business Suite <span className="footer-dot">·</span> Được thiết kế cho những điều lớn lao.</span><span>Chưa kết nối dữ liệu</span></footer>
  </div>;
}
