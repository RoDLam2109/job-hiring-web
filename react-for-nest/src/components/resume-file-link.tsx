import { Button } from 'antd';

export default function ResumeFileLink({ url }: { url?: string }) {
    if (!url?.trim()) return <span>Chưa có file CV</span>;
    const backend = (import.meta.env.VITE_BACKEND_URL ?? '').replace(/\/+$/, '');
    const href = /^https?:\/\//i.test(url)
        ? url
        : `${backend}/images/resume/${encodeURIComponent(url)}`;

    return <Button type="link" href={href} target="_blank" rel="noopener noreferrer">
        Xem file CV
    </Button>;
}
