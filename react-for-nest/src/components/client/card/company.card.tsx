import { getCompanyLogoUrl } from "@/utils/company-logo";
import { callFetchCompany } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { ICompany } from '@/types/backend';
import { Alert, Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';

interface IProps {
    showPagination?: boolean;
}

const CompanyCard = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayCompany, setDisplayCompany] = useState<ICompany[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(4);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=-updatedAt");
    const navigate = useNavigate();

    useEffect(() => {
        fetchCompany();
    }, [current, pageSize, filter, sortQuery]);

    const fetchCompany = async () => {
        setIsLoading(true);
        setError(null);
        let query = `current=${current}&pageSize=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        try {
            const res = await callFetchCompany(query);
            if (res?.data) {
                setDisplayCompany(res.data.result);
                setTotal(res.data.meta.total);
            } else {
                setError('Không thể tải danh sách công ty. Hãy kiểm tra backend đang chạy tại cổng 8080.');
            }
        } catch {
            setError('Không thể kết nối tới backend tại http://localhost:8080.');
        } finally {
            setIsLoading(false);
        }
    }


    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    }

    const handleViewDetailJob = (item: ICompany) => {
        if (item.name) {
            const slug = convertSlug(item.name);
            navigate(`/company/${slug}?id=${item._id}`)
        }
    }

    return (
        <div className={`${styles["company-section"]}`}>
            <div className={styles["company-content"]}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                <div>
                                    <span className={styles["title"]}>{showPagination ? 'Top Công Ty IT' : 'Nhà Tuyển Dụng Hàng Đầu'}</span>
                                    {showPagination && <p className={styles["section-subtitle"]}>Khám phá các công ty đang tuyển dụng nhiều vị trí công nghệ.</p>}
                                </div>
                                {!showPagination &&
                                    <Link to="company">Xem tất cả</Link>
                                }
                            </div>
                        </Col>

                        {error && <Col span={24}><Alert type="error" message={error} showIcon /></Col>}

                        {displayCompany?.map(item => {
                            return (
                                <Col span={24} sm={12} lg={6} key={item._id}>
                                    <Card
                                        className={styles["company-card"]}
                                        onClick={() => handleViewDetailJob(item)}
                                        role="link"
                                        tabIndex={0}
                                        aria-label={`Xem công ty ${item.name}`}
                                        onKeyDown={event => { if (event.key === 'Enter') handleViewDetailJob(item); }}
                                        hoverable
                                        cover={
                                            <div className={styles["company-logo-wrap"]}>
                                                <img
                                                    className={styles["company-logo"]}
                                                    alt={`Logo ${item.name}`}
                                                    src={getCompanyLogoUrl(item?.logo)}
                                                    onError={(event) => {
                                                        event.currentTarget.style.visibility = 'hidden';
                                                    }}
                                                />
                                            </div>
                                        }
                                    >
                                        <h3 className={styles["company-name"]}>{item.name}</h3>
                                        <p className={styles["company-address"]}>{item.address || 'Việt Nam'}</p>
                                    </Card>
                                </Col>
                            )
                        })}

                        {(!displayCompany || displayCompany && displayCompany.length === 0)
                            && !isLoading &&
                            <div className={styles["empty"]}>
                                <Empty description="Không có dữ liệu" />
                            </div>
                        }
                    </Row>
                    {showPagination && <>
                        <div style={{ marginTop: 30 }}></div>
                        <Row style={{ display: "flex", justifyContent: "center" }}>
                            <Pagination
                                current={current}
                                total={total}
                                pageSize={pageSize}
                                responsive
                                onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                            />
                        </Row>
                    </>}
                </Spin>
            </div>
        </div>
    )
}

export default CompanyCard;
