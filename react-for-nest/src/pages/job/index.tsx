import SearchClient from '@/components/client/search.client';
import styles from 'styles/client.module.scss';
import JobCard from '@/components/client/card/job.card';
const ClientJobPage = () => <div className={styles.container}><section className={styles['page-heading']}><span className={styles['section-kicker']}>FIND YOUR NEXT CHAPTER</span><h1>Cơ hội mới, dành cho bạn<span>.</span></h1><p>Tìm công việc phù hợp với kỹ năng và điều bạn muốn theo đuổi.</p><SearchClient /></section><section className={styles['listing-section']}><JobCard showPagination /></section></div>;
export default ClientJobPage;
