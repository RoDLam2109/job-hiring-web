import { Alert, Button, Card, Col, Row, Space, Statistic, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import { callFetchCompany, callFetchJob, callFetchResume, callFetchUser } from '@/config/api';
import { fetchAccess, unwrap } from '@/config/access-api';

const query = 'current=1&pageSize=1';
const modules = [
    { title: 'Company', path: '/admin/company', load: async () => unwrap(await callFetchCompany(query)).meta.total },
    { title: 'User', path: '/admin/user', load: async () => unwrap(await callFetchUser(query)).meta.total },
    { title: 'Job', path: '/admin/job', load: async () => unwrap(await callFetchJob(query)).meta.total },
    { title: 'Resume', path: '/admin/resume', load: async () => unwrap(await callFetchResume(query)).meta.total },
    { title: 'Permission', path: '/admin/permission', load: async () => (await fetchAccess('permissions', query)).meta.total },
    { title: 'Role', path: '/admin/role', load: async () => (await fetchAccess('roles', query)).meta.total },
];

type ModuleTotal = { total?: number; error?: string };

const DashboardPage = () => {
    const [totals, setTotals] = useState<ModuleTotal[]>([]);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        Promise.allSettled(modules.map(module => module.load())).then(results => {
            if (!active) return;
            setTotals(results.map(result => result.status === 'fulfilled'
                ? { total: result.value }
                : { error: result.reason instanceof Error ? result.reason.message : 'Không thể tải số liệu.' }));
            setLoading(false);
        });
        return () => { active = false; };
    }, [refresh]);

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col><Typography.Title level={3} style={{ margin: 0 }}>Tổng quan</Typography.Title></Col>
                <Col>
                    <Button icon={<ReloadOutlined />} loading={loading} onClick={() => setRefresh(value => value + 1)}>
                        Làm mới
                    </Button>
                </Col>
            </Row>
            <Row gutter={[20, 20]}>
                {modules.map((module, index) => (
                    <Col key={module.path} xs={24} sm={12} lg={8}>
                        <Link to={module.path} aria-label={`Xem danh sách ${module.title}`} style={{ display: 'block' }}>
                            <Card title={module.title} bordered={false} hoverable loading={loading}>
                                {totals[index]?.error ? (
                                    <Alert type="error" showIcon message="Không thể tải số liệu" description={totals[index].error} />
                                ) : (
                                    <Statistic
                                        title={`Tổng số ${module.title}`}
                                        value={totals[index]?.total}
                                        formatter={value => <CountUp end={Number(value)} separator="," />}
                                    />
                                )}
                                <Typography.Text type="secondary">Xem danh sách →</Typography.Text>
                            </Card>
                        </Link>
                    </Col>
                ))}
            </Row>
        </Space>
    );
};

export default DashboardPage;
