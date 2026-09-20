import { useEffect, useState } from 'react';
import { Alert, Button, Form, Input, Select, Space, Spin, message } from 'antd';
import axios from '@/config/axios-customize';
import { SKILLS_LIST } from '@/config/utils';
import { IBackendRes } from '@/types/backend';

const subscriptionError = (error: unknown) => {
    if (error instanceof Error && error.message === 'Network Error') {
        return 'Không thể kết nối máy chủ. Vui lòng kiểm tra backend đang chạy và bấm Thử lại.';
    }
    return error instanceof Error ? error.message : 'Không thể kết nối máy chủ.';
};

export default function EmailSubscription({ email }: { email: string }) {
    const [skills, setSkills] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError('');
        setSkills([]);
        axios.post<IBackendRes<{ skills: string[] } | null>, IBackendRes<{ skills: string[] } | null>>('/api/v1/subscribers/skills')
            .then(response => {
                if (!active) return;
                if (Number(response.statusCode) >= 400 || response.data === undefined) {
                    throw new Error(response.message || 'Không tải được kỹ năng đã đăng ký.');
                }
                setSkills(response.data?.skills ?? []);
            })
            .catch(error => { if (active) setError(subscriptionError(error)); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [email, revision]);

    const save = async () => {
        if (saving) return;
        setSaving(true);
        try {
            const response = await axios.patch<IBackendRes<{ acknowledged: boolean }>, IBackendRes<{ acknowledged: boolean }>>(
                '/api/v1/subscribers', { skills },
            );
            if (!response.data?.acknowledged) throw new Error(response.message || 'Không lưu được đăng ký.');
            message.success(skills.length ? 'Đã lưu đăng ký nhận job qua email.' : 'Đã tắt nhận job qua email.');
        } catch (error) {
            message.error(subscriptionError(error));
        } finally {
            setSaving(false);
        }
    };

    return <Spin spinning={loading}>
        <Form layout="vertical" style={{ maxWidth: 600 }} onFinish={save}>
            <Alert type="info" showIcon message="Chọn kỹ năng để nhận email về công việc phù hợp. Xóa hết kỹ năng và lưu để ngừng nhận email." style={{ marginBottom: 20 }} />
            {error && <Alert type="error" showIcon message={error} action={<Button onClick={() => setRevision(value => value + 1)}>Thử lại</Button>} style={{ marginBottom: 16 }} />}
            <Form.Item label="Email nhận việc làm"><Input value={email} disabled /></Form.Item>
            <Form.Item label="Kỹ năng quan tâm">
                <Select mode="multiple" allowClear options={SKILLS_LIST} value={skills} onChange={setSkills}
                    placeholder="Chọn kỹ năng" optionFilterProp="label" disabled={loading || saving || !!error} />
            </Form.Item>
            <Space><Button type="primary" htmlType="submit" loading={saving} disabled={loading || !!error}>
                {skills.length ? 'Nhận job qua email' : 'Lưu tùy chọn'}
            </Button></Space>
        </Form>
    </Spin>;
}
