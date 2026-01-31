"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [passkey, setPasskey] = useState("");
    const [error, setError] = useState(false);
    const { login } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = login(passkey);
        if (!success) {
            setError(true);
            setPasskey("");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center border border-gray-100">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <LayoutDashboard size={32} />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    연구과제 예산 관리
                </h1>
                <p className="text-gray-500 mb-8 text-sm">
                    시스템 접속을 위해 암호를 입력하세요.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            required
                            placeholder="Enter Passkey"
                            value={passkey}
                            onChange={(e) => {
                                setPasskey(e.target.value);
                                setError(false);
                            }}
                            className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-sm transition-all focus:ring-2 focus:outline-none ${error
                                    ? "border-red-500 focus:ring-red-100 focus:border-red-500"
                                    : "border-gray-200 focus:ring-indigo-100 focus:border-indigo-500"
                                }`}
                        />
                    </div>
                    {error && (
                        <p className="text-xs text-red-500 text-left ml-1">
                            암호가 일치하지 않습니다. 다시 입력해주세요.
                        </p>
                    )}
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-indigo-700 transition-all shadow-sm active:scale-[0.98]"
                    >
                        접속하기
                        <ArrowRight size={18} />
                    </button>
                </form>

                <div className="mt-8 text-[10px] text-gray-400 uppercase tracking-widest">
                    Authorized Personnel Only
                </div>
            </div>
        </div>
    );
}
