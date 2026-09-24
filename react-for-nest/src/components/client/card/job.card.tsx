import { getCompanyLogoUrl } from "@/utils/company-logo";
import { callFetchJob } from '@/config/api';
import { LOCATION_LIST, convertSlug, getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';
import { EnvironmentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Alert, Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime)

interface IProps {
    showPagination?: boolean;
}

const JobCard = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [total, setTotal] = useState(0);
    const [params] = useSearchParams();
    const filterValues: Record<string, any> = {};
    if (params.getAll('skills').length) filterValues.skills = { $in: params.getAll('skills') };
    const locations = params.getAll('location').filter(value => value !== 'ALL');
    if (locations.length) filterValues.location = { $in: locations };
    const filter = showPagination ? 'filter=' + encodeURIComponent(JSON.stringify(filterValues)) : '';
    const [sortQuery, setSortQuery] = useState("sort=-updatedAt");
    const navigate = useNavigate();
    useEffect(() => { setCurrent(1); }, [filter]);

    useEffect(() => {
        fetchJob();
    }, [current, pageSize, filter, sortQuery]);

    const fetchJob = async () => {
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
            const res = await callFetchJob(query);
            if (res?.data) {
                setDisplayJob(res.data.result);
                setTotal(res.data.meta.total);
            } else {
                setError('Không thể tải danh sách công việc. Hãy kiểm tra backend đang chạy tại cổng 8080.');
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

    const handleViewDetailJob = (item: IJob) => {
        const slug = convertSlug(item.name);
        navigate(`/job/${slug}?id=${item._id}`)
    }

    return (
        <div className={`${styles["card-job-section"]}`}>
            <div className={`${styles["job-content"]}`}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                <div><span className={styles["title"]}>Tìm thấy cơ hội. Chạm tới tương lai.</span><p className={styles["section-subtitle"]}>{showPagination ? total + ' cơ hội phù hợp với bạn' : 'Những vị trí mới nhất, sẵn sàng cho bước tiến của bạn.'}</p></div>
                                {!showPagination &&
                                    <Link to="job">Xem tất cả</Link>
                                }
                            </div>
                        </Col>

                        {error && <Col span={24}><Alert type="error" message={error} showIcon /></Col>}

                        {displayJob?.map(item => {
                            return (
                                <Col span={24} md={12} key={item._id}>
                                    <Card className={styles["job-card"]} size="small" title={null} hoverable
                                        onClick={() => handleViewDetailJob(item)}
                                        role="link"
                                        tabIndex={0}
                                        aria-label={`Xem việc làm ${item.name}`}
                                        onKeyDown={event => { if (event.key === 'Enter') handleViewDetailJob(item); }}
                                    >
                                        <div className={styles["card-job-content"]}>
                                            <div className={styles["card-job-left"]}>
                                                <img
                                                    alt={`Logo ${item.company?.name || 'company'}`}
                                                    src={getCompanyLogoUrl(item?.company?.logo)}
                                                    onError={(event) => {
                                                        event.currentTarget.style.visibility = 'hidden';
                                                    }}
                                                />
                                            </div>
                                            <div className={styles["card-job-right"]}>
                                                <div className={styles["job-title"]}>{item.name}</div>
                                                <div className={styles["job-company"]}>{item.company?.name}</div>
                                                <div className={styles["job-location"]}><EnvironmentOutlined style={{ color: '#58aaab' }} />&nbsp;{getLocationName(item.location)}</div>
                                                <div className={styles["job-salary"]}><ThunderboltOutlined />&nbsp;{(item.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</div>
                                                <div className={styles["job-updatedAt"]}>{dayjs(item.updatedAt).fromNow()}</div>
                                            </div>
                                        </div>

                                    </Card>
                                </Col>
                            )
                        })}


                        {(!displayJob || displayJob && displayJob.length === 0)
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

export default JobCard;
