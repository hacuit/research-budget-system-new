"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
    isAuthorized: boolean;
    loading: boolean;
    login: (passkey: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// 여기에 사용할 암호를 설정하세요 (기본값: 1234)
const SYSTEM_PASSKEY = process.env.NEXT_PUBLIC_PASSKEY || "1234";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // 브라우저에 저장된 인증 상태 확인
        const authStatus = localStorage.getItem("app_authorized");
        if (authStatus === "true") {
            setIsAuthorized(true);
        }
        setLoading(false);

        // 보호된 페이지 체크
        const isLoginPage = window.location.pathname === "/login";
        if (authStatus !== "true" && !isLoginPage) {
            router.push("/login");
        } else if (authStatus === "true" && isLoginPage) {
            router.push("/");
        }
    }, [router]);

    const login = (passkey: string) => {
        if (passkey === SYSTEM_PASSKEY) {
            localStorage.setItem("app_authorized", "true");
            setIsAuthorized(true);
            router.push("/");
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem("app_authorized");
        setIsAuthorized(false);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ isAuthorized, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
