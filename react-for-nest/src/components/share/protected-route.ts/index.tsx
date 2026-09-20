import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import NotPermitted from "./not-permitted";
import Loading from "../loading";

const RoleBaseRoute = (props: any) => {
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    const user = useAppSelector(state => state.account.user);
    const userRole = typeof user.role === 'string' ? user.role : user.role?.name;
    const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
    const isUser = userRole === 'NORMAL_USER' || userRole === 'USER';

    if ((isAdminRoute && isAdmin) ||
        (!isAdminRoute && (isUser || isAdmin))
    ) {
        return (<>{props.children}</>)
    } else {
        return (<NotPermitted />)
    }
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
