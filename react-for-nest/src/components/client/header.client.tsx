import { useState } from 'react';
import AccountModal from './account-modal';
import { Avatar, Button, Drawer, Dropdown, Menu, message } from 'antd';
import { ArrowUpOutlined, MenuOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { callLogout } from '@/config/api';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import styles from '@/styles/client.module.scss';
const Header = (_props: any) => {
 const [open, setOpen] = useState(false); const [accountOpen, setAccountOpen] = useState(false);
 const { isAuthenticated, user } = useAppSelector(state => state.account);
 const dispatch = useAppDispatch(); const navigate = useNavigate();
 const logout = async () => { try { const res = await callLogout(); if (res?.data) { dispatch(setLogoutAction({})); navigate('/'); message.success('Đã đăng xuất'); } } catch { message.error('Chưa thể đăng xuất. Vui lòng thử lại.'); } };
 const links = [{ to: '/', label: 'Khám phá' }, { to: '/job', label: 'Việc làm IT' }, { to: '/company', label: 'Công ty' }];
 return <><AccountModal open={accountOpen && isAuthenticated} onClose={() => setAccountOpen(false)} /><header className={styles['header-section']}><div className={styles['nav-inner']}>
 <Link to="/" className={styles.wordmark} aria-label="Workly - Trang chủ"><span className={styles['brand-mark']}>w</span>workly<span className={styles['brand-dot']}>.</span></Link>
 <nav className={styles['desktop-nav']} aria-label="Điều hướng chính">{links.map(link => <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => isActive ? styles.active : ''}>{link.label}</NavLink>)}</nav>
 <div className={styles['nav-actions']}>{isAuthenticated ? <Dropdown trigger={['click']} menu={{ items: [{ key: 'account', label: 'Quản lý tài khoản', onClick: () => setAccountOpen(true) }, { key: 'admin', label: <Link to='/admin'>Trang Quản Trị</Link> }, { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: logout }] }}><Button type="text"><Avatar size={30}>{user?.name?.slice(0, 1).toUpperCase() || 'U'}</Avatar><span>{user?.name || 'Tài khoản'}</span></Button></Dropdown> : <Link to="/login" className={styles['login-link']}>Đăng nhập <ArrowUpOutlined rotate={45} /></Link>}<Button className={styles['mobile-toggle']} aria-label="Mở menu" icon={<MenuOutlined />} onClick={() => setOpen(true)} /></div>
 </div></header><Drawer title="workly." open={open} onClose={() => setOpen(false)}><Menu items={links.map(link => ({ key: link.to, label: <Link to={link.to} onClick={() => setOpen(false)}>{link.label}</Link> }))} /></Drawer></>;
};
export default Header;
