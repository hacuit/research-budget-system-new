"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Project, Expense, CATEGORY_COLORS, BUDGET_CATEGORIES } from "@/types";
import {
    ArrowLeft,
    Calendar,
    Building2,
    TrendingUp,
    Plus,
} from "lucide-react";

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!projectId) return;

        // 과제 정보 가져오기
        const unsubProject = onSnapshot(doc(db, "projects", projectId), (doc) => {
            if (doc.exists()) {
                setProject({ id: doc.id, ...doc.data() } as Project);
            }
        });

        // 해당 과제의 지출 내역 가져오기
        const expensesQuery = query(
            collection(db, "expenses"),
            where("projectId", "==", projectId)
        );

        const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Expense[];
            // 날짜순 정렬 (최신순)
            data.sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setExpenses(data);
            setLoading(false);
        });

        return () => {
            unsubProject();
            unsubExpenses();
        };
    }, [projectId]);

    if (loading) return <div className="p-8">로딩 중...</div>;
    if (!project) return <div className="p-8">과제를 찾을 수 없습니다.</div>;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ko-KR").format(amount) + "원";
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("ko-KR");
    };

    // 비목별 지출 합계 계산
    const getCategorySpent = (category: string) => {
        return expenses
            .filter((e) => e.category === category)
            .reduce((sum, e) => sum + e.amount, 0);
    };

    // 전체 지출 합계
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBalance = project.totalBudget - totalSpent;
    const spentPercent = (totalSpent / project.totalBudget) * 100;

    return (
        <div className="max-w-5xl mx-auto">
            {/* 헤더 */}
            <div className="mb-8">
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft size={18} />
                    목록으로
                </Link>

                <div className="flex justify-between items-start">
                    <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-2">
                            {project.type}
                        </span>
                        <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                        <p className="text-gray-500 mt-1">{project.code}</p>
                    </div>
                    <Link
                        href={`/expenses?projectId=${projectId}`}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        <Plus size={18} />
                        지출 등록
                    </Link>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
                    <span className="flex items-center gap-1">
                        <Building2 size={14} />
                        {project.agency}
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(project.startDate)} ~ {formatDate(project.endDate)}
                    </span>
                </div>
            </div>

            {/* 전체 예산 요약 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">전체 예산 현황</h2>
                    <span className="flex items-center gap-1 text-sm">
                        <TrendingUp size={16} className="text-indigo-600" />
                        집행률 {spentPercent.toFixed(1)}%
                    </span>
                </div>

                {/* 진행 바 */}
                <div className="w-full bg-gray-100 rounded-full h-4 mb-6">
                    <div
                        className={`h-4 rounded-full ${spentPercent > 90
                                ? "bg-red-500"
                                : spentPercent > 70
                                    ? "bg-yellow-500"
                                    : "bg-indigo-600"
                            }`}
                        style={{ width: `${Math.min(spentPercent, 100)}%` }}
                    ></div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">총 연구비</p>
                        <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(project.totalBudget)}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">총 지출</p>
                        <p className="text-xl font-bold text-red-600">
                            {formatCurrency(totalSpent)}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">잔액</p>
                        <p className="text-xl font-bold text-green-600">
                            {formatCurrency(totalBalance)}
                        </p>
                    </div>
                </div>
            </div>

            {/* 비목별 현황 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">비목별 예산 현황</h2>
                <div className="space-y-4">
                    {BUDGET_CATEGORIES.map((category) => {
                        const allocated = project.budgetAllocation?.[category] || 0;
                        const spent = getCategorySpent(category);
                        const balance = allocated - spent;
                        const percent = allocated > 0 ? (spent / allocated) * 100 : 0;

                        return (
                            <div
                                key={category}
                                className="p-4 border border-gray-100 rounded-lg"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[category] || "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {category}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {percent.toFixed(1)}% 집행
                                    </span>
                                </div>

                                <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                                    <div
                                        className={`h-2 rounded-full ${percent > 100
                                                ? "bg-red-500"
                                                : percent > 90
                                                    ? "bg-yellow-500"
                                                    : "bg-indigo-500"
                                            }`}
                                        style={{ width: `${Math.min(percent, 100)}%` }}
                                    ></div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">배정</span>
                                        <p className="font-medium text-gray-900">
                                            {formatCurrency(allocated)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">지출</span>
                                        <p className="font-medium text-red-600">
                                            {formatCurrency(spent)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">잔액</span>
                                        <p
                                            className={`font-medium ${balance < 0 ? "text-red-600" : "text-green-600"
                                                }`}
                                        >
                                            {formatCurrency(balance)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 최근 지출 내역 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">지출 내역</h2>
                    <span className="text-sm text-gray-500">{expenses.length}건</span>
                </div>

                {expenses.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        등록된 지출 내역이 없습니다.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">날짜</th>
                                    <th className="px-6 py-3">적요</th>
                                    <th className="px-6 py-3">비목</th>
                                    <th className="px-6 py-3 text-right">금액</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatDate(expense.date)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                            {expense.description}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[expense.category] ||
                                                    "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">
                                            {formatCurrency(expense.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
