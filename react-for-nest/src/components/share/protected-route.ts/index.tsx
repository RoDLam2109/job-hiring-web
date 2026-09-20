import { Navigate, useLocation } from "react-router-dom";
import { canAccessAdminPage, getAdminLandingPath } from '@/config/permission';
import { useAppSelector } from "@/redux/hooks";
import NotPermitted from "./not-permitted";
import Loading from "../loading";

const RoleBaseRoute = (props: any) => {
    const location = useLocation();
    const pathname = location.pathname.replace(/\/+$/, '');
    const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
    const user = useAppSelector(state => state.account.user);
    if (!isAdminRoute || canAccessAdminPage(user, pathname, location.search)) {
        return <>{props.children}</>;
    }
    const landing = getAdminLandingPath(user);
    if (pathname === '/admin' && landing) return <Navigate to={landing} replace />;
    return <NotPermitted />;
}

const ProtectedRoute = (props: any) => {
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated)
    const isLoading = useAppSelector(state => state.account.isLoading)

    return (
        <>
            {isLoading === true ?
                <Loading />
                :
                <>
                    {isAuthenticated === true ?
                        <>
                            <RoleBaseRoute>
                                {props.children}
                            </RoleBaseRoute>
                        </>
                        :
                        <Navigate to='/login' replace />
                    }
                </>
            }
        </>
    )
}

export default ProtectedRoute;
