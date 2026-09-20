import { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import axios from '@/config/axios-customize';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';
import { IBackendRes } from '@/types/backend';

export default function AccountSettings({ password = false }: { password?: boolean }) {
    const user = useAppSelector(state => state.account.user);
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const save = async (values: { name: string; phone: string; currentPassword: string; newPassword: string }) => {
        if (saving) return;
        setSaving(true);
        try {
            const response = await axios.patch<IBackendRes<{ name?: string; phone?: string; changed?: boolean }>, IBackendRes<{ name?: string; phone?: string; changed?: boolean }>>(
                `/api/v1/users/me/${password ? 'password' : 'phone'}`,
                password ? { currentPassword: values.currentPassword, newPassword: values.newPassword } : { name: values.name.trim(), phone: values.phone.trim() },
            );
            if (Number(response.statusCode) >= 400 || !response.data || (password && !response.data.changed)) {
                throw new Error(Array.isArray(response.message) ? response.message.join(', ') : response.message || 'Không lưu được thay đổi.');
            }
            if (password) form.resetFields();
            else dispatch(setUserLoginInfo({ name: response.data.name, phone: response.data.phone }));
            message.success(password ? 'Đã đổi mật khẩu thành công.' : 'Đã cập nhật thông tin.');
        } catch (error) {
            message.error(error instanceof Error ? error.message : 'Không thể kết nối máy chủ.');
        } finally { setSaving(false); }
    };
    return <Form form={form} layout="vertical" style={{ maxWidth: 600 }} initialValues={{ name: user.name, phone: user.phone }} onFinish={save} disabled={saving}>
        {password ? <>
            <Form.Item name="currentPassword" label="Mật khẩu hiện tại" rules={[{ required: true, message: 'Nhập mật khẩu hiện tại' }]}>
                <Input.Password autoComplete="current-password" />
            </Form.Item>
            <Form.Item name="newPassword" label="Mật khẩu mới" rules={[
                { required: true, message: 'Nhập mật khẩu mới' },
                { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                { validator: (_, value) => !value || new TextEncoder().encode(value).length <= 72 ? Promise.resolve() : Promise.reject(new Error('Mật khẩu không được vượt quá 72 byte')) },
            ]}><Input.Password autoComplete="new-password" /></Form.Item>
            <Form.Item name="confirmPassword" label="Xác nhận mật khẩu mới" dependencies={['newPassword']} rules={[
                { required: true, message: 'Xác nhận mật khẩu mới' },
                ({ getFieldValue }) => ({ validator: (_, value) => !value || value === getFieldValue('newPassword') ? Promise.resolve() : Promise.reject(new Error('Mật khẩu xác nhận không khớp')) }),
            ]}><Input.Password autoComplete="new-password" /></Form.Item>
        </> : <>
            <Form.Item name="name" label="Họ và tên" rules={[
                { required: true, whitespace: true, message: 'Nhập họ và tên' },
                { max: 100, message: 'Họ và tên không được vượt quá 100 ký tự' },
            ]}><Input autoComplete="name" maxLength={100} /></Form.Item>
            <Form.Item label="Email"><Input value={user.email} disabled /></Form.Item>
            <Form.Item label="Role"><Input value={(typeof user.role === 'object' ? user.role?.name : user.role) || 'Chưa được gán role'} readOnly /></Form.Item>
            <Form.Item label="Công ty"><Input value={user.company?.name || 'Bạn chưa thuộc công ty nào'} readOnly /></Form.Item>
            <Form.Item name="phone" label="Số điện thoại" rules={[
                { required: true, message: 'Nhập số điện thoại' },
                { pattern: /^(0\d{9}|\+84\d{9})$/, message: 'Nhập số dạng 0xxxxxxxxx hoặc +84xxxxxxxxx', transform: value => value?.trim() },
            ]}><Input type="tel" autoComplete="tel" /></Form.Item>
        </>}
        <Button type="primary" htmlType="submit" loading={saving}>{password ? 'Đổi mật khẩu' : 'Lưu thông tin'}</Button>
    </Form>;
}
