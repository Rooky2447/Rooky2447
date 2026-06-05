import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-qc-cream">
                <div className="card-brutal p-6 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
                    <span className="font-bold">Chargement...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    return children;
};

export default ProtectedRoute;
