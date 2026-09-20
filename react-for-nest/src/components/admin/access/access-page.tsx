import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Switch, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PermissionSwitches from './permission-switches';
import { AccessRecord, AccessResource, AccessValues, Permission, Role, deleteAccess, fetchAccess, fetchAccessById, saveAccess } from '@/config/access-api';

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Không thể kết nối máy chủ.';
const dateText = (value?: string) => value ? dayjs(value).format('DD-MM-YYYY HH:mm:ss') : '—';

export default function AccessPage({ resource }: { resource: AccessResource }) {
    const isRole = resource === 'roles';
    const label = isRole ? 'Role' : 'Permission';
    const [rows, setRows] = useState<AccessRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sort, setSort] = useState('-updatedAt');
    const [search, setSearch] = useState('');
    const [draftSearch, setDraftSearch] = useState('');
    const [revision, setRevision] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string>();
    const [preparing, setPreparing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string>();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [form] = Form.useForm<AccessValues>();
    const requestId = useRef(0);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const id = ++requestId.current;
        setLoading(true);
        setError('');
        // Escape regex syntax so the search text is treated literally.
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const query = new URLSearchParams({ current: String(page), pageSize: String(pageSize), sort });
        if (escaped) query.set('name', '/' + escaped + '/i');
        fetchAccess(resource, query.toString()).then(data => {
            if (id !== requestId.current) return;
            if (page > 1 && data.result.length === 0) {
                setPage(Math.max(1, Math.ceil(data.meta.total / pageSize)));
            }
            setRows(data.result);
            setTotal(data.meta.total);
        }).catch(error => {
            if (id === requestId.current) {
                setError(errorMessage(error));
                setRows([]);
                setTotal(0);
            }
        }).finally(() => {
            if (id === requestId.current) setLoading(false);
        });
        return () => { requestId.current++; };
    }, [resource, page, pageSize, sort, search, revision]);

    const reload = () => setRevision(value => value + 1);

    const openEditor = async (row?: AccessRecord) => {
        setPreparing(true);
        try {
            const record = row ? await fetchAccessById(resource, row._id) : undefined;
            if (isRole) {
                const options: Permission[] = [];
                let current = 1;
                let pages = 1;
                do {
                    const data = await fetchAccess('permissions', 'current=' + current + '&pageSize=100&sort=module,name');
                    options.push(...data.result as Permission[]);
                    pages = data.meta.pages;
                    current++;
                } while (current <= pages);
                // Preserve assigned permissions even if they are absent from the current catalog.
                for (const assigned of (record as Role | undefined)?.permissions ?? []) {
                    const id = typeof assigned === 'string' ? assigned : assigned._id;
                    if (!options.some(item => item._id === id)) {
                        options.push(typeof assigned === 'string'
                            ? { _id: id, name: id, apiPath: '', method: '', module: 'Quyền đã gán' }
                            : assigned);
                    }
                }
                setPermissions(options);
            }
            form.resetFields();
            form.setFieldsValue(record ? {
                ...record,
                permissions: isRole ? ((record as Role).permissions ?? []).map(item => typeof item === 'string' ? item : item._id) : undefined,
            } : { name: '', description: '', isActive: true, permissions: [], method: 'GET' });
            setEditingId(record?._id);
            setOpen(true);
        } catch (error) {
            messageApi.error(errorMessage(error));
        } finally {
            setPreparing(false);
        }
    };

    const submit = async (values: AccessValues) => {
        setSaving(true);
        try {
            const payload: AccessValues = isRole ? {
                name: values.name.trim(),
                description: values.description?.trim(),
                isActive: values.isActive,
                permissions: values.permissions ?? [],
            } : {
                name: values.name.trim(),
                apiPath: values.apiPath?.trim(),
                method: values.method,
                module: values.module?.trim().toUpperCase(),
            };
            await saveAccess(resource, payload, editingId);
            messageApi.success((editingId ? 'Cập nhật ' : 'Thêm ') + label + ' thành công');
            setOpen(false);
            reload();
        } catch (error) {
            messageApi.error(errorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id: string) => {
        setDeleting(id);
        try {
            await deleteAccess(resource, id);
            messageApi.success('Xóa ' + label + ' thành công');
            reload();
        } catch (error) {
            messageApi.error(errorMessage(error));
        } finally {
            setDeleting(undefined);
        }
    };

    const columns: ColumnsType<AccessRecord> = [
        { title: 'Id', dataIndex: '_id', width: 240 },
        { title: 'Name', dataIndex: 'name', sorter: true, width: 220 },
        ...(isRole ? [{
            title: 'Trạng thái', dataIndex: 'isActive', width: 130,
            render: (active: boolean) => <Tag color={active ? 'green' : 'default'}>{active ? 'ACTIVE' : 'INACTIVE'}</Tag>,
        }] : [
            { title: 'API Path', dataIndex: 'apiPath', width: 240 },
            { title: 'Method', dataIndex: 'method', width: 110, render: (method: string) => <Tag color={method === 'GET' ? 'blue' : method === 'DELETE' ? 'red' : 'gold'}>{method}</Tag> },
            { title: 'Module', dataIndex: 'module', width: 150 },
        ]),
        { title: 'CreatedAt', dataIndex: 'createdAt', sorter: true, width: 190, render: dateText },
        { title: 'UpdatedAt', dataIndex: 'updatedAt', sorter: true, width: 190, render: dateText },
        {
            title: 'Actions', key: 'actions', width: 110, fixed: 'right',
            render: (_, row) => <Space>
                <Button type="text" aria-label={'Sửa ' + row.name} title="Sửa" icon={<EditOutlined style={{ color: '#d89614' }} />} disabled={preparing} onClick={() => openEditor(row)} />
                <Popconfirm title={'Xóa ' + label + ' này?'} description={row.name} okText="Xóa" cancelText="Hủy" onConfirm={() => remove(row._id)}>
                    <Button type="text" danger aria-label={'Xóa ' + row.name} title="Xóa" icon={<DeleteOutlined />} loading={deleting === row._id} />
                </Popconfirm>
            </Space>,
        },
    ];

    return <Space direction="vertical" size={20} style={{ width: '100%' }}>
        {contextHolder}
        <Card>
            <Form layout="inline" onFinish={() => { setPage(1); setSearch(draftSearch.trim()); reload(); }} style={{ gap: 12 }}>
                <Form.Item label="Name">
                    <Input aria-label={'Tìm ' + label + ' theo tên'} placeholder="Nhập tên cần tìm" allowClear value={draftSearch} onChange={event => setDraftSearch(event.target.value)} style={{ width: 280, maxWidth: '100%' }} />
                </Form.Item>
                <Space wrap>
                    <Button onClick={() => { setDraftSearch(''); setSearch(''); setPage(1); setSort('-updatedAt'); reload(); }}>Làm lại</Button>
                    <Button type="primary" htmlType="submit">Tìm kiếm</Button>
                </Space>
            </Form>
        </Card>
        {error && <Alert type="error" showIcon message="Không tải được dữ liệu" description={error} action={<Button onClick={reload}>Thử lại</Button>} />}
        <Card title={isRole ? 'Danh sách Roles (Vai trò)' : 'Danh sách Permissions (Quyền hạn)'} extra={<Space>
            <Button type="primary" icon={<PlusOutlined />} loading={preparing} onClick={() => openEditor()}>Thêm mới</Button>
            <Button icon={<ReloadOutlined />} aria-label="Tải lại danh sách" onClick={reload} loading={loading} />
        </Space>}>
            <Table<AccessRecord> rowKey="_id" columns={columns} dataSource={rows} loading={loading} scroll={{ x: isRole ? 1100 : 1450 }}
                locale={{ emptyText: search ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có dữ liệu' }}
                pagination={{ current: page, pageSize, total, showSizeChanger: true, showTotal: (total, range) => range[0] + '-' + range[1] + ' trên ' + total + ' bản ghi' }}
                onChange={(pagination, _, sorter) => {
                    setPage(pagination.current ?? 1);
                    setPageSize(pagination.pageSize ?? 10);
                    const selected = Array.isArray(sorter) ? sorter[0] : sorter;
                    setSort(selected.order ? (selected.order === 'descend' ? '-' : '') + String(selected.field) : '-updatedAt');
                }}
            />
        </Card>
        <Modal forceRender title={(editingId ? 'Cập nhật ' : 'Thêm mới ') + label} open={open} onCancel={() => { if (!saving) setOpen(false); }}
            onOk={() => form.submit()} confirmLoading={saving} cancelButtonProps={{ disabled: saving }} okText="Lưu" cancelText="Hủy" width={isRole ? 1000 : 720} maskClosable={false}>
            <Form form={form} layout="vertical" onFinish={submit} disabled={saving}>
                <Form.Item name="name" label="Tên" rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập tên' }]}><Input /></Form.Item>
                {isRole ? <>
                    <Form.Item name="description" label="Mô tả" rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập mô tả' }]}><Input.TextArea rows={3} /></Form.Item>
                    <Form.Item name="isActive" label="Hoạt động" valuePropName="checked"><Switch /></Form.Item>
                    <Form.Item name="permissions" label="Quyền hạn" extra="Bật/tắt từng quyền hoặc toàn bộ module. Nhấn Lưu để áp dụng.">
                        <PermissionSwitches permissions={permissions} disabled={saving} />
                    </Form.Item>
                </> : <>
                    <Form.Item name="apiPath" label="API Path" rules={[{ required: true, message: 'Vui lòng nhập đường dẫn API' }, { pattern: /^\/\S*$/, message: 'Đường dẫn phải bắt đầu bằng / và không chứa khoảng trắng' }]}><Input placeholder="/api/v1/companies/:id" /></Form.Item>
                    <Form.Item name="method" label="Method" rules={[{ required: true }]}><Select options={methods.map(value => ({ value, label: value }))} /></Form.Item>
                    <Form.Item name="module" label="Module" rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập module' }]}><Input placeholder="COMPANIES" /></Form.Item>
                </>}
            </Form>
        </Modal>
    </Space>;
}
