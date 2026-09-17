import { ConfigProvider, theme } from 'antd';
import { ReactNode } from 'react';
export default function DarkTheme({ children }: { children: ReactNode }) {
    return <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: {
        colorPrimary: '#c4f46d', colorBgBase: '#0b0d0c', colorBgContainer: '#141715',
        colorBgElevated: '#1c211e', colorText: '#f2f5ef', colorTextSecondary: '#a0aaa1',
        colorBorder: '#333a34', borderRadius: 12, controlHeight: 44,
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif'
    }, components: { Button: { primaryColor: '#11160c' } } }}>{children}</ConfigProvider>;
}
