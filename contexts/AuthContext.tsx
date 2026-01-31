"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithRedirect, signOut } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);

            const isLoginPage = window.location.pathname === "/login";

            if (user && isLoginPage) {
                router.push("/");
            } else if (!user && !isLoginPage) {
                // 로그인되지 않은 사용자가 보호된 페이지에 접근하면 로그인 페이지로 리다이렉트
                router.push("/login");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            // 모바일 인앱 브라우저(카카오 등) 호환성을 위해 리디렉션 방식 사용
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error("Login failed", error);
            alert("로그인 시작 중 오류가 발생했습니다.");
        }
    };

    const logout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
