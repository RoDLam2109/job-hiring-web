import { Divider } from 'antd';
import styles from 'styles/client.module.scss';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';

const HomePage = () => {
    return (
        <div className={`${styles["container"]} ${styles["home-section"]}`}>
            <div className={styles["home-hero"]}>
                <div>
                    <span className={styles["hero-eyebrow"]}>Nền tảng tuyển dụng công nghệ</span>
                    <h1>Tìm công việc IT phù hợp với bạn</h1>
                    <p>Khám phá các cơ hội mới tại những công ty công nghệ hàng đầu.</p>
                </div>
                <SearchClient />
            </div>
            <Divider />
            <CompanyCard />
            <div style={{ margin: 50 }}></div>
            <Divider />
            <JobCard />
        </div>
    )
}

export default HomePage;
