import { Button, Form, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { LOCATION_LIST, SKILLS_LIST } from '@/config/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from '@/styles/client.module.scss';
import { useEffect } from 'react';
const SearchClient = () => {
 const [form] = Form.useForm(); const navigate = useNavigate(); const [params] = useSearchParams();
 useEffect(() => { form.setFieldsValue({ skills: params.getAll('skills'), location: params.getAll('location') }); }, [params, form]);
 return <Form form={form} className={styles['search-form']} onFinish={values => { const query = new URLSearchParams(); (values.skills || []).forEach((v: string) => query.append('skills', v)); (values.location || []).forEach((v: string) => query.append('location', v)); navigate('/job?' + query.toString()); }}>
 <Form.Item name="skills" label="Kỹ năng của bạn"><Select mode="multiple" allowClear options={SKILLS_LIST} placeholder="React, Java, UI/UX..." maxTagCount="responsive" /></Form.Item>
 <Form.Item name="location" label="Nơi bạn muốn làm việc"><Select mode="multiple" allowClear options={LOCATION_LIST} placeholder="Tất cả địa điểm" maxTagCount="responsive" /></Form.Item>
 <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>Tìm việc ngay</Button></Form>;
};
export default SearchClient;
