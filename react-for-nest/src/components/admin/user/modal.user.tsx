import { ModalForm, ProForm, ProFormDigit, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Row, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useState, useEffect, useCallback, useRef } from "react";
import { callCreateUser, callFetchCompany, callUpdateUser } from "@/config/api";
import { IUser } from "@/types/backend";
import { DebounceSelect } from "./debouce.select";
import { fetchAccess, unwrap } from "@/config/access-api";
import { companyOption, companySearchQuery, userFormValues } from "@/utils/admin-forms";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IUser | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

export interface ICompanySelect {
    label: string;
    value: string;
    key?: string;
}

const ModalUser = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [saving, setSaving] = useState(false);
    const savingRef = useRef(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (openModal) form.setFieldsValue(userFormValues(dataInit));
    }, [openModal, dataInit, form]);

    const handleReset = () => {
        if (savingRef.current) return;
        setOpenModal(false);
        setDataInit(null);
    };

    const submitUser = async (values: any) => {
        if (savingRef.current) return false;
        if (!values.company?.value || !values.company?.label) {
            form.setFields([{ name: 'company', errors: ['Vui lòng chọn công ty.'] }]);
            return false;
        }
        savingRef.current = true;
        setSaving(true);
        try {
            const user: IUser = {
                name: values.name.trim(), email: values.email.trim(),
                age: values.age, gender: values.gender, address: values.address.trim(),
                role: values.role,
                company: { _id: values.company.value, name: values.company.label },
                ...(dataInit?._id ? { _id: dataInit._id } : { password: values.password }),
            };
            unwrap(await (dataInit?._id ? callUpdateUser(user) : callCreateUser(user)));
            message.success(dataInit?._id ? 'Cập nhật user thành công' : 'Thêm mới user thành công');
            setOpenModal(false);
            setDataInit(null);
            reloadTable();
        } catch (error) {
            notification.error({
                message: 'Không thể lưu user',
                description: error instanceof Error ? error.message : 'Vui lòng thử lại.',
            });
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
        return false;
    };

    const fetchCompanyList = useCallback(async (name: string): Promise<ICompanySelect[]> => {
        const data = unwrap(await callFetchCompany(companySearchQuery(name)));
        return data.result.flatMap(item => {
            const option = companyOption(item);
            return option ? [option] : [];
        });
    }, []);

    return (
        <>
            <ModalForm
                title={<>{dataInit?._id ? "Cập nhật User" : "Tạo mới User"}</>}
                open={openModal}
                modalProps={{
                    onCancel: () => { handleReset() },
                    destroyOnClose: true,
                    forceRender: true,
                    closable: !saving,
                    width: isMobile ? "100%" : 900,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{dataInit?._id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: "Hủy"
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitUser}
                initialValues={userFormValues(dataInit)}
                disabled={saving}
                submitter={{
                    submitButtonProps: { loading: saving },
                    resetButtonProps: { disabled: saving, onClick: handleReset },
                }}
            >
                <Row gutter={16}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng không bỏ trống' },
                                { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
                            ]}
                            placeholder="Nhập email"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText.Password
                            disabled={dataInit?._id ? true : false}
                            label="Password"
                            name="password"
                            rules={[{ required: dataInit?._id ? false : true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập password"
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormText
                            label="Tên hiển thị"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập tên hiển thị"
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            label="Tuổi"
                            name="age"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập nhập tuổi"
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormSelect
                            name="gender"
                            label="Giới Tính"
                            valueEnum={{
                                male: 'Nam',
                                female: 'Nữ',
                                other: 'Khác',
                            }}
                            placeholder="Please select a gender"
                            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormSelect
                            name="role"
                            label="Vai trò"
                            request={async () => {
                                try {
                                    const data = await fetchAccess('roles', 'current=1&pageSize=100');
                                    const options = data.result.map(role => ({ label: role.name, value: role._id }));
                                    const currentRole = dataInit?.role;
                                    if (currentRole && typeof currentRole === 'object'
                                        && !options.some(option => option.value === currentRole._id)) {
                                        options.push({ label: currentRole.name, value: currentRole._id });
                                    }
                                    return options;
                                } catch {
                                    message.error('Không tải được danh sách vai trò. Vui lòng mở lại form để thử lại.');
                                    const role = dataInit?.role;
                                    return role ? [{ label: typeof role === 'string' ? role : role.name,
                                        value: typeof role === 'string' ? role : role._id }] : [];
                                }
                            }}
                            placeholder="Please select a role"
                            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProForm.Item
                            name="company"
                            label="Thuộc Công Ty"
                            rules={[{ required: true, message: 'Vui lòng chọn company!' }]}
                        >
                            <DebounceSelect
                                allowClear
                                showSearch
                                placeholder="Chọn công ty"
                                fetchOptions={fetchCompanyList}
                                style={{ width: '100%' }}
                            />
                        </ProForm.Item>

                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Địa chỉ"
                            name="address"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập địa chỉ"
                        />
                    </Col>
                </Row>
            </ModalForm>
        </>
    )
}

export default ModalUser;
