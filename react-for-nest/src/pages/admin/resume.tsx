import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IResume } from "@/types/backend";
import { DeleteOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';
import { Alert, Button, Popconfirm, message, notification } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteResume } from "@/config/api";
import queryString from 'query-string';
import { hasPermission } from "@/config/permission";
import { fetchResume } from "@/redux/slice/resumeSlide";
import ViewDetailResume from "@/components/admin/resume/view.resume";

const ResumePage = () => {
    const tableRef = useRef<ActionType>();
    const user = useAppSelector(state => state.account.user);
    const canDelete = hasPermission(user, 'DELETE', '/api/v1/resumes/:id');
    const [deletingId, setDeletingId] = useState<string>();

    const isFetching = useAppSelector(state => state.resume.isFetching);
    const error = useAppSelector(state => state.resume.error);
    const meta = useAppSelector(state => state.resume.meta);
    const resumes = useAppSelector(state => state.resume.result);
    const dispatch = useAppDispatch();

    const [dataInit, setDataInit] = useState<IResume | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

    const handleDeleteResume = async (_id: string | undefined) => {
        if (!_id || deletingId || !canDelete) return;
        setDeletingId(_id);
        try {
            const res = await callDeleteResume(_id);
            if (res && res.data) {
                message.success('Xóa Resume thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res?.message || 'Không thể xóa resume. Vui lòng thử lại.'
                });
            }
        } catch {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: 'Không thể xóa resume. Vui lòng thử lại.',
            });
        } finally {
            setDeletingId(undefined);
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IResume>[] = [
        {
            title: 'Id',
            dataIndex: '_id',
            width: 250,
            render: (text, record, index, action) => {
                return (
                    <a href="#" onClick={() => {
                        setOpenViewDetail(true);
                        setDataInit(record);
                    }}>
                        {record._id}
                    </a>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            sorter: true,
            renderFormItem: (item, props, form) => (
                <ProFormSelect
                    showSearch
                    mode="multiple"
                    allowClear
                    valueEnum={{
                        PENDING: 'PENDING',
                        REVIEWING: 'REVIEWING',
                        APPROVED: 'APPROVED',
                        REJECTED: 'REJECTED',
                    }}
                    placeholder="Chọn level"
                />
            ),
        },

        {
            title: 'Job',
            dataIndex: ["jobId", "name"],
            hideInSearch: true,
        },
        {
            title: 'Company',
            dataIndex: ["companyId", "name"],
            hideInSearch: true,
        },

        {
            title: 'CreatedAt',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'UpdatedAt',
            dataIndex: 'updatedAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Thao tác',
            key: 'actions',
            hideInSearch: true,
            hideInTable: !canDelete,
            width: 110,
            fixed: 'right',
            render: (_value, entity) => (
                <Popconfirm
                    placement="leftTop"
                    title="Xác nhận xóa resume"
                    description="Bạn có chắc chắn muốn xóa resume này?"
                    onConfirm={() => handleDeleteResume(entity._id)}
                    disabled={!!deletingId || !entity._id}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                >
                    <Button
                        danger
                        type="link"
                        icon={<DeleteOutlined />}
                        loading={!!entity._id && deletingId === entity._id}
                        disabled={!!deletingId || !entity._id}
                    >
                        Xóa
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        // if (clone.name) clone.name = `/${clone.name}/i`;
        // if (clone.salary) clone.salary = `/${clone.salary}/i`;
        if (clone?.status?.length) {
            clone.status = clone.status.join(",");
        }

        let temp = queryString.stringify(clone);

        let sortBy = "";
        if (sort && sort.status) {
            sortBy = sort.status === 'ascend' ? "sort=status" : "sort=-status";
        }

        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt" : "sort=-createdAt";
        }
        if (sort && sort.updatedAt) {
            sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt" : "sort=-updatedAt";
        }

        //mặc định sort theo updatedAt
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=-updatedAt`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        temp += "&populate=companyId,jobId&fields=companyId._id, companyId.name, companyId.logo, jobId._id, jobId.name";
        return temp;
    }

    return (
        <div>
            {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }}
                action={<Button onClick={reloadTable} disabled={isFetching}>Thử lại</Button>} />}
            <DataTable<IResume>
                actionRef={tableRef}
                headerTitle="Danh sách Resumes"
                rowKey="_id"
                loading={isFetching}
                columns={columns}
                dataSource={resumes}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    try {
                        const response = await dispatch(fetchResume({ query })).unwrap();
                        return { data: response.data?.result ?? [], total: response.data?.meta.total ?? 0, success: true };
                    } catch {
                        return { data: [], total: 0, success: false };
                    }
                }}
                scroll={{ x: true }}
                pagination={
                    {
                        current: meta.current,
                        pageSize: meta.pageSize,
                        showSizeChanger: true,
                        total: meta.total,
                        showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                    }
                }
                rowSelection={false}
                toolBarRender={(_action, _rows): any => {
                    return (
                        <></>
                    );
                }}
            />
            <ViewDetailResume
                open={openViewDetail}
                onClose={setOpenViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
                reloadTable={reloadTable}
            />
        </div>
    )
}

export default ResumePage;
