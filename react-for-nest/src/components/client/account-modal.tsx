import { useEffect, useState } from 'react';
import { Alert, Button, Descriptions, Modal, Popconfirm, Space, Table, Tabs, Tag, message } from 'antd';
import dayjs from 'dayjs';
import { useAppSelector } from '@/redux/hooks';
import axios from '@/config/axios-customize';
import { IBackendRes, IResume } from '@/types/backend';
import EmailSubscription from './email-subscription';
import AccountSettings from './account-settings';

export default function AccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const user = useAppSelector(state => state.account.user);
    const [rows, setRows] = useState<IResume[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);
    const [detail, setDetail] = useState<IResume>();
    const [tab, setTab] = useState('resumes');
    const [deletingId, setDeletingId] = useState<string>();

    const deleteResume = async (id: string) => {
        if (deletingId) return;
        setDeletingId(id);
        try {
            const response = await axios.delete<IBackendRes<{ deleted: boolean }>, IBackendRes<{ deleted: boolean }>>(
                `/api/v1/resumes/by-user/${id}`,
            );
            if (!response.data?.deleted) throw new Error(response.message || 'Không thể xóa CV.');
            setRows(current => current.filter(row => row._id !== id));
            setDetail(current => current?._id === id ? undefined : current);
            message.success('Đã xóa hồ sơ ứng tuyển.');
        } catch (error) {
            message.error(error instanceof Error ? error.message : 'Không thể kết nối máy chủ.');
        } finally {
            setDeletingId(undefined);
        }
    };
    useEffect(() => {
        if (!open) return;
        let active = true;
        setTab('resumes');
        setRows([]);
        setError('');
        setLoading(true);
        axios.post<IBackendRes<IResume[]>, IBackendRes<IResume[]>>('/api/v1/resumes/by-user').then(response => {
            if (!active) return;
            if (!Array.isArray(response.data)) throw new Error(response.message || 'Không tải được danh sách CV.');
            setRows(response.data);
        }).catch(error => {
            if (active) setError(error instanceof Error ? error.message : 'Không thể kết nối máy chủ.');
        }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [open, user._id, revision]);

    const companyName = (row: IResume) => typeof row.companyId === 'object' ? row.companyId?.name ?? '—' : '—';
    const jobName = (row: IResume) => typeof row.jobId === 'object' ? row.jobId?.name ?? '—' : '—';

    return <>
        <Modal title="Quản lý tài khoản" open={open} onCancel={() => { setDetail(undefined); onClose(); }} footer={null} width={1100} destroyOnClose>
            <Tabs activeKey={tab} onChange={setTab} items={[
                { key: 'email-subscription', label: 'Nhận job qua email', children: open ? <EmailSubscription key={user._id} email={user.email} /> : null },
                { key: 'resumes', label: 'Rải CV', children: <div style={{ minHeight: 360 }}>
                    {error && <Alert type="error" showIcon message={error} action={<Button onClick={() => setRevision(value => value + 1)}>Thử lại</Button>} style={{ marginBottom: 16 }} />}
                    <Table<IResume> rowKey="_id" dataSource={rows} loading={loading} scroll={{ x: 800 }} pagination={{ pageSize: 5, hideOnSinglePage: true }} locale={{ emptyText: 'Bạn chưa ứng tuyển công việc nào' }} columns={[
                        { title: 'STT', width: 65, render: (_, row) => rows.indexOf(row) + 1 },
                        { title: 'Công ty', render: (_, row) => companyName(row) },
                        { title: 'Vị trí', render: (_, row) => jobName(row) },
                        { title: 'Trạng thái', dataIndex: 'status', render: (status: string) => <Tag>{status}</Tag> },
                        { title: 'Ngày rải CV', dataIndex: 'createdAt', render: (date?: string) => date ? dayjs(date).format('DD-MM-YYYY HH:mm:ss') : '—' },
                        { title: 'Thao tác', render: (_, row) => <Space>
                            <Button type="link" onClick={() => setDetail(row)}>Chi tiết</Button>
                            <Popconfirm title="Xóa hồ sơ ứng tuyển này?" description="Hồ sơ sẽ được gỡ khỏi danh sách ứng tuyển." okText="Xóa" cancelText="Hủy" disabled={!!deletingId} onConfirm={() => row._id && deleteResume(row._id)}>
                                <Button danger type="link" loading={deletingId === row._id} disabled={!!deletingId || !row._id}>Xóa CV</Button>
                            </Popconfirm>
                        </Space> },
                    ]} />
                </div> },
                { key: 'profile', label: 'Cập nhật thông tin', children: open ? <AccountSettings key={user._id} /> : null },
                { key: 'password', label: 'Thay đổi mật khẩu', children: open ? <AccountSettings key={user._id} password /> : null },
            ]} />
        </Modal>
        <Modal title="Chi tiết ứng tuyển" open={open && !!detail} onCancel={() => setDetail(undefined)} footer={null}>
            {detail && <Descriptions column={1} items={[
                { key: 'company', label: 'Công ty', children: companyName(detail) },
                { key: 'job', label: 'Vị trí', children: jobName(detail) },
                { key: 'status', label: 'Trạng thái', children: detail.status },
                { key: 'email', label: 'Email', children: detail.email },
                { key: 'cv', label: 'CV', children: detail.url },
            ]} />}
        </Modal>
    </>;
}
