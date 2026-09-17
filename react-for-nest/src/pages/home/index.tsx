import { ArrowUpOutlined, CodeOutlined, CheckOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';
const HomePage = () => <div className={styles.container}>
 <section className={styles['home-hero']}><div className={styles['hero-copy']}>
 <span className={styles['hero-eyebrow']}><i /> DÀNH CHO THẾ HỆ CÔNG NGHỆ MỚI</span>
 <h1>Công việc mới.<br /><span>Phiên bản tốt hơn.</span></h1>
 <p>Tìm nơi tài năng của bạn được trân trọng.<br />Khám phá cơ hội công nghệ và viết tiếp hành trình của riêng mình.</p>
 <div className={styles['hero-note']}><span><CheckOutlined /> Cơ hội phù hợp</span><span><CheckOutlined /> Kết nối trực tiếp</span></div></div>
 <div className={styles['hero-art']} aria-hidden="true"><div className={styles.orbit} /><div className={styles['orbit-two']} /><div className={styles['art-label']}>YOUR NEXT CHAPTER</div><div className={styles['art-arrow']}><ArrowUpOutlined rotate={45} /></div><div className={styles['floating-card']}><span className={styles['code-icon']}><CodeOutlined /></span><div><strong>Build your future.</strong><small>Bắt đầu từ một cơ hội mới</small></div><span className={styles['status-dot']} /></div><span className={styles['art-caption']}>THINK BIG. START HERE. ↗</span></div>
 <div className={styles['hero-search']}><SearchClient /><div className={styles['popular-search']}><span>Được quan tâm:</span>{['REACT.JS', 'NEST.JS', 'JAVA', 'TYPESCRIPT'].map(skill => <Link key={skill} to={'/job?skills=' + encodeURIComponent(skill)}>{skill} ↗</Link>)}</div></div></section>
 <section className={styles['listing-section']}><div className={styles['section-kicker']}>01 / GẶP GỠ NHÀ TUYỂN DỤNG</div><CompanyCard /></section>
 <section className={styles['listing-section']}><div className={styles['section-kicker']}>02 / BƯỚC TIẾP THEO CỦA BẠN</div><JobCard /></section>
 <section className={styles['career-banner']}><div><span className={styles['section-kicker']}>MAKE YOUR NEXT MOVE</span><h2>Sẵn sàng cho chương tiếp theo?</h2><p>Một cơ hội phù hợp có thể thay đổi cả hành trình.</p></div><Link to="/job">Khám phá việc làm <ArrowUpOutlined rotate={45} /></Link></section>
 </div>;
export default HomePage;
