import { store } from '@/redux/store';
import { setLogoutAction, setRefreshTokenAction } from '@/redux/slice/accountSlide';
import { createApiClient } from './auth-client';

const instance = createApiClient(import.meta.env.VITE_BACKEND_URL as string, {
    readToken: () => localStorage.getItem('access_token'),
    writeToken: token => localStorage.setItem('access_token', token),
    expire: () => {
        store.dispatch(setLogoutAction({}));
        if (window.location.pathname.startsWith('/admin')) {
            store.dispatch(setRefreshTokenAction({
                status: true,
                message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
            }));
        }
    },
});

export default instance;
