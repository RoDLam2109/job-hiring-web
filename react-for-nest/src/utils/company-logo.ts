export const getCompanyLogoUrl = (logo?: string): string => {
    if (!logo) return '';
    if (/^https?:\/\//i.test(logo)) return logo;
    const backend = (import.meta.env.VITE_BACKEND_URL ?? '').replace(/\/+$/, '');
    return `${backend}/images/company/${encodeURIComponent(logo)}`;
};
