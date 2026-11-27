import type { Locale } from './index';

const vi = {
  everydayEdit: 'TUYỂN CHỌN MỖI NGÀY', aurumEdit: 'TUYỂN CHỌN AURUM', curatedLiving: 'CHỌN LỌC CHO ĐỜI SỐNG', beautyCaption: 'THÊM MỘT CHÚT ĐẸP', everydayCaption: 'TRONG TỪNG NGÀY',
  announcement: 'MỘT KHÔNG GIAN MUA SẮM ĐƯỢC CHỌN LỌC', dedicated: 'DÀNH RIÊNG CHO BẠN',
  home: 'Aurum Shop trang chủ', navigation: 'Điều hướng cửa hàng', discover: 'Khám phá', products: 'Sản phẩm', shopping: 'Mua sắm',
  title: 'Những điều đẹp đẽ,', titleEm: 'theo cách của bạn.', intro: 'Không gian mua sắm dành cho những lựa chọn thật ý nghĩa. Tinh tế trong từng chi tiết, gần gũi với mỗi ngày.',
  explore: 'Khám phá cửa hàng', selected: 'CHỌN LỌC CHO BẠN', experience: 'Trải nghiệm mua sắm Aurum', art: 'Đẹp trong', artEm: 'từng khoảnh khắc.',
  inspiration: '01 / CẢM HỨNG', valueTitle: 'Chọn điều bạn yêu.', valueDesc: 'Một góc nhỏ dành cho những khám phá mới và những điều làm cuộc sống thêm đặc biệt.',
  collection: 'BỘ SƯU TẬP', productTitle: 'Khám phá sản phẩm', productDesc: 'Những lựa chọn dành cho phong cách riêng của bạn.',
  emptyTitle: 'Danh mục đang được chuẩn bị', emptyDesc: 'Sản phẩm sẽ xuất hiện tại đây khi cửa hàng kết nối dữ liệu.', comeBack: 'VUI LÒNG QUAY LẠI SAU',
  shopTogether: 'MUA SẮM CÙNG AURUM', serviceTitle: 'Trải nghiệm dành cho bạn', serviceDesc: 'Những tiện ích mua sắm đang được chuẩn bị.', preparing: 'ĐANG CHUẨN BỊ',
  searchTitle: 'Tìm kiếm & bộ lọc', searchDesc: 'Tìm kiếm sẽ khả dụng khi danh mục sản phẩm được kết nối.', detailTitle: 'Chi tiết sản phẩm', detailDesc: 'Thông tin, giá và lựa chọn sản phẩm sẽ hiển thị từ cửa hàng.',
  cartTitle: 'Giỏ hàng & thanh toán', cartDesc: 'Giỏ hàng và thanh toán chưa được kết nối.', accountTitle: 'Tài khoản & đơn hàng', accountDesc: 'Tài khoản và theo dõi đơn hàng chưa khả dụng.', footer: 'Một chút tinh tế cho mỗi ngày.',
} as const;
type StorefrontKey = keyof typeof vi;
const en: Record<StorefrontKey, string> = {
  everydayEdit: 'THE EVERYDAY EDIT', aurumEdit: 'THE AURUM EDIT', curatedLiving: 'CURATED FOR EVERYDAY LIVING', beautyCaption: 'A LITTLE MORE BEAUTY', everydayCaption: 'IN YOUR EVERYDAY',
  announcement: 'A THOUGHTFULLY CURATED SHOPPING EXPERIENCE', dedicated: 'MADE FOR YOU',
  home: 'Aurum Shop home', navigation: 'Shop navigation', discover: 'Discover', products: 'Products', shopping: 'Shopping',
  title: 'Beautiful things,', titleEm: 'your way.', intro: 'A space for meaningful choices. Thoughtful in every detail, made for everyday life.',
  explore: 'Explore the shop', selected: 'SELECTED FOR YOU', experience: 'The Aurum shopping experience', art: 'Beauty in', artEm: 'every moment.',
  inspiration: '01 / INSPIRATION', valueTitle: 'Choose what you love.', valueDesc: 'A little space for new discoveries and the things that make life special.',
  collection: 'THE COLLECTION', productTitle: 'Discover products', productDesc: 'Selections for your own personal style.',
  emptyTitle: 'The collection is being prepared', emptyDesc: 'Products will appear here when the shop is connected.', comeBack: 'PLEASE CHECK BACK SOON',
  shopTogether: 'SHOP WITH AURUM', serviceTitle: 'An experience for you', serviceDesc: 'Shopping features are being prepared.', preparing: 'COMING SOON',
  searchTitle: 'Search & filters', searchDesc: 'Search will be available when the product catalog is connected.', detailTitle: 'Product details', detailDesc: 'Details, prices and options will appear when the shop is connected.',
  cartTitle: 'Cart & checkout', cartDesc: 'The cart and checkout are not connected yet.', accountTitle: 'Account & orders', accountDesc: 'Accounts and order tracking are not available yet.', footer: 'A little elegance for every day.',
};
export const storefrontCatalog: Record<Locale, Readonly<Record<StorefrontKey, string>>> = { vi, en };
