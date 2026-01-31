"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Receipt, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
    { name: "대시보드", href: "/", icon: LayoutDashboard },
    { name: "과제 관리", href: "/projects", icon: FolderKanban },
    { name: "지출 등록", href: "/expenses", icon: Receipt },
    { name: "설정", href: "/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <aside className="hidden md:flex w-64 bg-white shadow-md h-screen fixed left-0 top-0 flex-col z-10">
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                    연구과제 관리
                </h1>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.href)
                            ? "bg-indigo-50 text-indigo-600 font-semibold"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-4 py-2 mb-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                            user?.displayName?.charAt(0) || "U"
                        )}
                    </div>
                    <div className="text-sm flex-1 min-w-0">
                        <p className="font-medium text-gray-700 truncate">
                            {user?.displayName || "사용자"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                </div>
                {user && (
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={16} />
                        로그아웃
                    </button>
                )}
            </div>
        </aside>
    );
}
