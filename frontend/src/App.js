import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import ChatPage from "@/pages/ChatPage";
import GuidesPage from "@/pages/GuidesPage";
import GuideDetail from "@/pages/GuideDetail";
import AuthCallback from "@/pages/AuthCallback";
import PricingPage from "@/pages/PricingPage";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Account from "@/pages/Account";
import NotFound from "@/pages/NotFound";
import Privacy from "@/pages/legal/Privacy";
import Terms from "@/pages/legal/Terms";
import Disclaimer from "@/pages/legal/Disclaimer";
import ProtectedRoute from "@/components/ProtectedRoute";

const AppRouter = () => {
    const location = useLocation();
    // Process session_id during render to avoid race conditions
    if (location.hash?.includes("session_id=")) {
        return <AuthCallback />;
    }
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/chat"
                element={
                    <ProtectedRoute>
                        <ChatPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/account"
                element={
                    <ProtectedRoute>
                        <Account />
                    </ProtectedRoute>
                }
            />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/guides/:slug" element={<GuideDetail />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route
                path="/payment/success"
                element={
                    <ProtectedRoute>
                        <PaymentSuccess />
                    </ProtectedRoute>
                }
            />
            <Route path="/legal/privacy" element={<Privacy />} />
            <Route path="/legal/terms" element={<Terms />} />
            <Route path="/legal/disclaimer" element={<Disclaimer />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <AuthProvider>
                    <AppRouter />
                </AuthProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;
