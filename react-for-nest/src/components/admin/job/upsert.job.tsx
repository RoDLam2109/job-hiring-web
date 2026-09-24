import { Alert, Breadcrumb, Button, Col, ConfigProvider, Divider, Form, Row, Spin, message, notification } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DebounceSelect } from "../user/debouce.select";
import { FooterToolbar, ProForm, ProFormDatePicker, ProFormDigit, ProFormSelect, ProFormSwitch, ProFormText } from "@ant-design/pro-components";
import styles from 'styles/admin.module.scss';
import { LOCATION_LIST, SKILLS_LIST } from "@/config/utils";
import { ICompanySelect } from "../user/modal.user";
import { useState, useEffect, useCallback, useRef } from 'react';
import { callCreateJob, callFetchCompany, callFetchCompanyById, callFetchJobById, callUpdateJob } from "@/config/api";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CheckSquareOutlined } from "@ant-design/icons";
import enUS from 'antd/lib/locale/en_US';
import { IJob } from "@/types/backend";
import { useAppSelector } from '@/redux/hooks';
import { unwrap } from '@/config/access-api';
import { buildJobPayload, companyOption, companySearchQuery, hasRichText, jobFormValues } from '@/utils/admin-forms';

const JobForm = ({ id }: { id: string | null }) => {
    const navigate = useNavigate();
    const account = useAppSelector(state => state.account.user);
    const roleName = typeof account.role === 'string' ? account.role : account.role?.name;
    const isHr = roleName === 'HR';
    const ownCompanyId = account.company?._id;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [loadVersion, setLoadVersion] = useState(0);
    const savingRef = useRef(false);
    const companyRecords = useRef(new Map<string, NonNullable<IJob['company']>>());

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setLoadError('');
        companyRecords.current.clear();
        form.setFieldsValue(jobFormValues());
        const load = async () => {
            try {
                if (isHr && !ownCompanyId) throw new Error('Tài khoản HR chưa được gán công ty.');
                if (id) {
                    const job = unwrap(await callFetchJobById(id));
                    if (cancelled) return;
                    if (job._id !== id) throw new Error('Không tìm thấy job cần cập nhật.');
                    if (job.company?._id) companyRecords.current.set(job.company._id, job.company);
                    form.setFieldsValue(jobFormValues(job));
                } else if (isHr && ownCompanyId) {
                    const company = unwrap(await callFetchCompanyById(ownCompanyId));
                    if (cancelled) return;
                    if (!company._id || !company.name) throw new Error('Không tải được thông tin công ty.');
                    companyRecords.current.set(company._id, { _id: company._id, name: company.name, logo: company.logo });
                    form.setFieldValue('company', companyOption(company));
                }
            } catch (error) {
                if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Không tải được dữ liệu.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        void load();
        return () => { cancelled = true; };
    }, [id, form, isHr, ownCompanyId, loadVersion]);

    const fetchCompanyList = useCallback(async (name: string): Promise<ICompanySelect[]> => {
        if (isHr) {
            const own = ownCompanyId ? companyRecords.current.get(ownCompanyId) : undefined;
            const option = companyOption(own);
            return option ? [option] : [];
        }
        const data = unwrap(await callFetchCompany(companySearchQuery(name)));
        return data.result.flatMap(company => {
            if (!company._id || !company.name) return [];
            companyRecords.current.set(company._id, { _id: company._id, name: company.name, logo: company.logo });
            return [companyOption(company)!];
        });
    }, [isHr, ownCompanyId]);

    const onFinish = async (values: ReturnType<typeof jobFormValues>) => {
        if (loading || loadError || savingRef.current) return false;
        savingRef.current = true;
        setSaving(true);
        try {
            const job = buildJobPayload(values, companyRecords.current.get(values.company?.value ?? ''));
            unwrap(await (id ? callUpdateJob(job, id) : callCreateJob(job)));
            message.success(id ? 'Cập nhật job thành công' : 'Tạo mới job thành công');
            navigate('/admin/job');
        } catch (error) {
            notification.error({
                message: 'Không thể lưu job',
                description: error instanceof Error ? error.message : 'Vui lòng thử lại.',
            });
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
        return false;
    };

    return (
        <div className={styles["upsert-job-container"]}>
            <div className={styles["title"]}>
                <Breadcrumb
                    separator=">"
                    items={[
                        {
                            title: <Link to="/admin/job">Manage Job</Link>,
                        },
                        {
                            title: id ? 'Cập nhật Job' : 'Tạo mới Job',
                        },
                    ]}
                />
            </div>
            <div >

                {loadError && <Alert type="error" showIcon message={loadError}
                    action={<Button onClick={() => setLoadVersion(v => v + 1)}>Thử lại</Button>} />}
                <Spin spinning={loading}>
                <ConfigProvider locale={enUS}>
                    <ProForm
                        dateFormatter={false}
                        initialValues={jobFormValues()}
                        disabled={loading || saving || !!loadError}
                        form={form}
                        onFinish={onFinish}
                        submitter={
                            {
                                searchConfig: {
                                    resetText: "Hủy",
                                    submitText: <>{id ? "Cập nhật Job" : "Tạo mới Job"}</>
                                },
                                resetButtonProps: { preventDefault: true, disabled: saving, onClick: () => navigate('/admin/job') },
                                render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                                submitButtonProps: {
                                    loading: saving,
                                    disabled: loading || !!loadError,
                                    icon: <CheckSquareOutlined />
                                },
                            }
                        }
                    >
                        <Row gutter={[20, 20]}>
                            <Col span={24} md={12}>
                                <ProFormText
                                    label="Tên Job"
                                    name="name"
                                    rules={[
                                        { required: true, message: 'Vui lòng không bỏ trống' },
                                    ]}
                                    placeholder="Nhập tên job"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="skills"
                                    label="Kỹ năng yêu cầu"
                                    options={SKILLS_LIST}
                                    placeholder="Please select a skill"
                                    rules={[{ required: true, message: 'Vui lòng chọn kỹ năng!' }]}
                                    allowClear
                                    mode="multiple"
                                    fieldProps={{
                                        showArrow: false
                                    }}

                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="location"
                                    label="Địa điểm"
                                    options={LOCATION_LIST.filter(item => item.value !== 'ALL')}
                                    placeholder="Please select a location"
                                    rules={[{ required: true, message: 'Vui lòng chọn địa điểm!' }]}
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormDigit
                                    label="Mức lương"
                                    name="salary"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập mức lương"
                                    fieldProps={{
                                        min: 0,
                                        addonAfter: " đ",
                                        formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                        parser: (value) => +(value || '').replace(/\$\s?|(,*)/g, '')
                                    }}
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormDigit
                                    label="Số lượng"
                                    name="quantity"
                                    fieldProps={{ min: 1, precision: 0 }}
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập số lượng"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="level"
                                    label="Trình độ"
                                    valueEnum={{
                                        INTERN: 'INTERN',
                                        FRESHER: 'FRESHER',
                                        JUNIOR: 'JUNIOR',
                                        MIDDLE: 'MIDDLE',
                                        SENIOR: 'SENIOR',
                                    }}
                                    placeholder="Please select a level"
                                    rules={[{ required: true, message: 'Vui lòng chọn level!' }]}
                                />
                            </Col>

                                <Col span={24} md={6}>
                                    <ProForm.Item
                                        name="company"
                                        label="Thuộc Công Ty"
                                        rules={[{ required: true, message: 'Vui lòng chọn company!' }]}
                                    >
                                        <DebounceSelect
                                            disabled={isHr || loading || saving || !!loadError}
                                            allowClear={!isHr}
                                            showSearch
                                            placeholder="Chọn công ty"
                                            fetchOptions={fetchCompanyList}
                                            style={{ width: '100%' }}
                                        />
                                    </ProForm.Item>

                                </Col>

                        </Row>
                        <Row gutter={[20, 20]}>
                            <Col span={24} md={6}>
                                <ProFormDatePicker
                                    label="Ngày bắt đầu"
                                    name="startDate"
                                    fieldProps={{
                                        format: 'DD/MM/YYYY',

                                    }}
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu hợp lệ' }]}
                                    placeholder="dd/mm/yyyy"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormDatePicker
                                    label="Ngày kết thúc"
                                    name="endDate"
                                    fieldProps={{
                                        format: 'DD/MM/YYYY',

                                    }}
                                    // width="auto"
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc hợp lệ' }]}
                                    placeholder="dd/mm/yyyy"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSwitch
                                    label="Trạng thái"
                                    name="isActive"
                                    checkedChildren="ACTIVE"
                                    unCheckedChildren="INACTIVE"
                                />
                            </Col>
                            <Col span={24}>
                                <ProForm.Item
                                    name="description"
                                    label="Miêu tả job"
                                    rules={[{ validator: (_, value) => hasRichText(value) ? Promise.resolve() : Promise.reject(new Error('Vui lòng nhập miêu tả job!')) }]}
                                >
                                    <ReactQuill
                                        theme="snow"
                                        readOnly={loading || saving || !!loadError}
                                    />
                                </ProForm.Item>
                            </Col>
                        </Row>
                        <Divider />
                    </ProForm>
                </ConfigProvider>
                </Spin>

            </div>
        </div>
    )
}

const ViewUpsertJob = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (params.has('id') && !id) {
        return <Alert type="error" message="Thiếu ID job cần cập nhật."
            action={<Link to="/admin/job">Quay lại danh sách</Link>} />;
    }
    return <JobForm key={id ?? 'new-job'} id={id} />;
};

export default ViewUpsertJob;
