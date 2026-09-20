import { Card, Col, Collapse, Empty, Row, Space, Switch, Typography } from 'antd';
import type { Permission } from '@/config/access-api';

interface Props {
    value?: string[];
    onChange?: (value: string[]) => void;
    permissions: Permission[];
    disabled?: boolean;
}

const methodColors: Record<string, string> = {
    GET: '#1677ff', POST: '#389e0d', PUT: '#d48806', PATCH: '#595959', DELETE: '#cf1322',
};

export default function PermissionSwitches({ value = [], onChange, permissions, disabled }: Props) {
    const selected = new Set(value);
    const groups = Array.from(new Set(permissions.map(item => item.module))).sort();
    const toggle = (ids: string[], checked: boolean) => {
        const next = new Set(value);
        ids.forEach(id => checked ? next.add(id) : next.delete(id));
        onChange?.(Array.from(next));
    };

    if (!permissions.length) return <Empty description="Chưa có quyền hạn. Hãy thêm quyền ở trang Permission." />;

    return <Collapse defaultActiveKey={groups.slice(0, 1)} items={groups.map(group => {
        const items = permissions.filter(item => item.module === group);
        const count = items.filter(item => selected.has(item._id)).length;
        return {
            key: group,
            label: <Space wrap>{group}<Typography.Text type="secondary">{count}/{items.length}</Typography.Text></Space>,
            extra: <span onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
                <Switch aria-label={'Bật/tắt toàn bộ quyền ' + group} checked={count === items.length} disabled={disabled}
                    onChange={checked => toggle(items.map(item => item._id), checked)} />
            </span>,
            children: <Row gutter={[16, 16]}>{items.map(item => <Col key={item._id} xs={24} md={12}>
                <Card size="small" style={{ height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <Switch aria-label={item.name + ' ' + item.method + ' ' + item.apiPath} checked={selected.has(item._id)}
                            disabled={disabled} onChange={checked => toggle([item._id], checked)} style={{ flexShrink: 0, marginTop: 3 }} />
                        <div style={{ minWidth: 0 }}>
                            <div style={{ marginBottom: 6, overflowWrap: 'anywhere' }}>{item.name}</div>
                            <div style={{ overflowWrap: 'anywhere' }}>
                                <strong style={{ color: methodColors[item.method] ?? '#595959', marginRight: 8 }}>{item.method}</strong>
                                <Typography.Text type="secondary">{item.apiPath}</Typography.Text>
                            </div>
                        </div>
                    </div>
                </Card>
            </Col>)}</Row>,
        };
    })} />;
}
