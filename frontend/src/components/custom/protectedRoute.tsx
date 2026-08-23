import { Navigate } from "react-router-dom";
import { Spinner } from "../ui/spinner";
import { useAuth } from "./authContext"

const ProtectedRoute = ({children}: {children: React.ReactNode}) => {
    const {token, isLoading} = useAuth();

    if(isLoading) {
        return <Spinner />
    }

    if(!token) {
        return <Navigate to="/signup" replace />
    }

    return children
}

export default ProtectedRoute;