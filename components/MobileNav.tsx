"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Receipt, Settings } from "lucide-react";

const menuItems = [
    { name: "대시보드", href: "/", icon: LayoutDashboard },
    { name: "과제", href: "/projects", icon: FolderKanban },
    { name: "지출", href: "/expenses", icon: Receipt },
    { name: "설정", href: "/settings", icon: Settings },
];

export default function MobileNav() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
            <div className="flex justify-around items-center h-16">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive(item.href)
                                ? "text-indigo-600"
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        <item.icon size={24} strokeWidth={isActive(item.href) ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{item.name}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
