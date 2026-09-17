import { Link } from 'react-router-dom';
import styles from '@/styles/client.module.scss';
const Footer = () => <footer className={styles.footer}><div className={styles.container}><div className={styles['footer-top']}><div><Link to="/" className={styles.wordmark}>workly<span className={styles['brand-dot']}>.</span></Link><p>Kết nối tài năng. Mở lối tương lai.</p></div><nav aria-label="Liên kết cuối trang"><Link to="/job">Tìm việc làm</Link><Link to="/company">Khám phá công ty</Link><Link to="/register">Tạo tài khoản</Link></nav></div><div className={styles['footer-bottom']}><span>© {new Date().getFullYear()} Workly</span><span>Được tạo cho những bước tiến mới. ↗</span></div></div></footer>;
export default Footer;
