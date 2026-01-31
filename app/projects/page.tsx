"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { Project, Expense } from "@/types";
import { Plus, Calendar, Building2, Wallet } from "lucide-react";

export default function ProjectsPage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        // 과제 목록 가져오기
        const projectsQuery = query(
            collection(db, "projects"),
            orderBy("createdAt", "desc")
        );

        const unsubProjects = onSnapshot(projectsQuery, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Project[];
            setProjects(data);
        });

        // 지출 내역 가져오기 (전체)
        const expensesQuery = query(collection(db, "expenses"));
        const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Expense[];
            setExpenses(data);
            setLoading(false);
        });

        return () => {
            unsubProjects();
            unsubExpenses();
        };
    }, [user]);

    // 과제별 총 지출 계산
    const getProjectExpenses = (projectId: string) => {
        return expenses
            .filter((e) => e.projectId === projectId)
            .reduce((sum, e) => sum + e.amount, 0);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ko-KR").format(amount) + "원";
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "short",
        });
    };

    if (loading) return <div className="p-8">로딩 중...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">연구과제 목록</h1>
                    <p className="text-gray-500 mt-1">
                        등록된 연구과제 {projects.length}개
                    </p>
                </div>
                <Link
                    href="/projects/new"
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                    <Plus size={20} />새 과제 등록
                </Link>
            </div>

            {projects.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wallet className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        등록된 과제가 없습니다
                    </h3>
                    <p className="text-gray-500 mb-6">
                        새 연구과제를 등록하고 예산을 관리해보세요.
                    </p>
                    <Link
                        href="/projects/new"
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={18} />첫 과제 등록하기
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {projects.map((project) => {
                        const totalSpent = getProjectExpenses(project.id);
                        const balance = project.totalBudget - totalSpent;
                        const spentPercent = (totalSpent / project.totalBudget) * 100;

                        return (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-2">
                                            {project.type}
                                        </span>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {project.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">{project.code}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Building2 size={14} />
                                        {project.agency}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {formatDate(project.startDate)} ~{" "}
                                        {formatDate(project.endDate)}
                                    </span>
                                </div>

                                {/* 예산 진행 바 */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">예산 집행률</span>
                                        <span className="font-medium text-gray-900">
                                            {spentPercent.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full ${spentPercent > 90
                                                    ? "bg-red-500"
                                                    : spentPercent > 70
                                                        ? "bg-yellow-500"
                                                        : "bg-indigo-600"
                                                }`}
                                            style={{ width: `${Math.min(spentPercent, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500">총액</p>
                                        <p className="font-bold text-gray-900">
                                            {formatCurrency(project.totalBudget)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">지출</p>
                                        <p className="font-bold text-red-600">
                                            {formatCurrency(totalSpent)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">잔액</p>
                                        <p className="font-bold text-green-600">
                                            {formatCurrency(balance)}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
