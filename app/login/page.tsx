"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard } from "lucide-react";

export default function LoginPage() {
    const { signInWithGoogle } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-100">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <LayoutDashboard size={32} />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    연구과제 예산 관리
                </h1>
                <p className="text-gray-500 mb-8">
                    연구비 지출 내역을 간편하게 관리하세요.
                </p>

                <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    Google 계정으로 시작하기
                </button>

                <div className="mt-8 text-xs text-gray-400">
                    로그인이 안 되나요? Firebase Console에서<br />
                    Authentication &gt; Sign-in method를 확인하세요.
                </div>
            </div>
        </div>
    );
}
