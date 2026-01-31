"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import {
    PROJECT_TYPES,
    AGENCIES,
    BUDGET_CATEGORIES,
    BudgetAllocation,
} from "@/types";
import { ArrowLeft, Save, Calculator } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<{
        title: string;
        code: string;
        type: string;
        agency: string;
        startDate: string;
        endDate: string;
        totalBudget: string;
        directCostRatio: string;
    }>({
        title: "",
        code: "",
        type: PROJECT_TYPES[0],
        agency: AGENCIES[0],
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        totalBudget: "",
        directCostRatio: "80",
    });

    // 비목별 배정액 (비율로 입력받고 금액으로 변환)
    const [budgetRatios, setBudgetRatios] = useState<Record<string, string>>({
        인건비: "40",
        학생인건비: "20",
        재료비: "20",
        연구활동비: "15",
        연구수당: "5",
    });

    const totalBudgetNum = Number(formData.totalBudget) || 0;
    const directCost = (totalBudgetNum * Number(formData.directCostRatio)) / 100;

    // 비율 합계 계산
    const totalRatio = Object.values(budgetRatios).reduce(
        (sum, r) => sum + (Number(r) || 0),
        0
    );

    // 비목별 실제 금액 계산
    const calculateBudgetAllocation = (): BudgetAllocation => {
        const allocation: BudgetAllocation = {
            인건비: 0,
            학생인건비: 0,
            재료비: 0,
            연구활동비: 0,
            연구수당: 0,
        };

        BUDGET_CATEGORIES.forEach((cat) => {
            const ratio = Number(budgetRatios[cat]) || 0;
            allocation[cat] = Math.floor((directCost * ratio) / 100);
        });

        return allocation;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert("로그인이 필요합니다.");
        if (totalRatio !== 100)
            return alert("비목별 비율 합계가 100%가 되어야 합니다.");

        setLoading(true);
        try {
            await addDoc(collection(db, "projects"), {
                ...formData,
                totalBudget: Number(formData.totalBudget),
                directCostRatio: Number(formData.directCostRatio),
                budgetAllocation: calculateBudgetAllocation(),
                userId: user.uid,
                createdAt: serverTimestamp(),
            });
            alert("과제가 등록되었습니다!");
            router.push("/projects");
        } catch (error) {
            console.error(error);
            alert("등록 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ko-KR").format(amount) + "원";
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft size={18} />
                    목록으로
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">새 연구과제 등록</h1>
                <p className="text-gray-500 mt-1">
                    과제 정보와 비목별 예산을 설정하세요.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 기본 정보 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">기본 정보</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                과제명 *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="예: AI 기반 의료 진단 시스템 개발"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                className="block w-full rounded-lg border-gray-200 border p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                과제 코드 *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="예: 2024R1A1A1234567"
                                value={formData.code}
                                onChange={(e) =>
                                    setFormData({ ...formData, code: e.target.value })
                                }
                                className="block w-full rounded-lg border-gray-200 border p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                과제 유형 *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) =>
                                    setFormData({ ...formData, type: e.target.value })
                                }
                                className="block w-full rounded-lg border-gray-200 border p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                            >
                                {PROJECT_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                지원기관 *
                            </label>
                            <select
                                value={formData.agency}
                                onChange={(e) =>
                                    setFormData({ ...formData, agency: e.target.value })
                                }
                                className="block w-full rounded-lg border-gray-200 border p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                            >
                                {AGENCIES.map((agency) => (
                                    <option key={agency} value={agency}>
                                        {agency}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                시작일 *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, startDate: e.target.value })
                                }
                                className="block w-full rounded-lg border-gray-200 border p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                종료일 *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.endDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, endDate: e.target.value })
                                }
                                className="block w-full rounded-lg border-gray-200 border p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 예산 정보 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">예산 정보</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                총 연구비 (원) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                placeholder="100000000"
                                value={formData.totalBudget}
                                onChange={(e) =>
                                    setFormData({ ...formData, totalBudget: e.target.value })
                                }
                                className="block w-full rounded-lg border-gray-200 border p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {totalBudgetNum > 0 && (
                                <p className="text-sm text-gray-500 mt-1">
                                    = {formatCurrency(totalBudgetNum)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                직접비 비율 (%) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                max="100"
                                value={formData.directCostRatio}
                                onChange={(e) =>
                                    setFormData({ ...formData, directCostRatio: e.target.value })
                                }
                                className="block w-full rounded-lg border-gray-200 border p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {directCost > 0 && (
                                <p className="text-sm text-gray-500 mt-1">
                                    직접비 = {formatCurrency(directCost)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 비목별 비율 설정 */}
                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Calculator size={18} />
                                비목별 배정 비율 (직접비 기준)
                            </h3>
                            <span
                                className={`text-sm font-medium ${totalRatio === 100 ? "text-green-600" : "text-red-600"
                                    }`}
                            >
                                합계: {totalRatio}% {totalRatio === 100 ? "✓" : "(100% 필요)"}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {BUDGET_CATEGORIES.map((category) => {
                                const ratio = Number(budgetRatios[category]) || 0;
                                const amount = Math.floor((directCost * ratio) / 100);

                                return (
                                    <div
                                        key={category}
                                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                                    >
                                        <span className="w-24 text-sm font-medium text-gray-700">
                                            {category}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={budgetRatios[category]}
                                                onChange={(e) =>
                                                    setBudgetRatios({
                                                        ...budgetRatios,
                                                        [category]: e.target.value,
                                                    })
                                                }
                                                className="w-20 rounded-lg border-gray-200 border p-2 text-sm text-center"
                                            />
                                            <span className="text-gray-500">%</span>
                                        </div>
                                        <span className="ml-auto text-sm font-medium text-gray-900">
                                            {formatCurrency(amount)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 제출 버튼 */}
                <div className="flex justify-end gap-4">
                    <Link
                        href="/projects"
                        className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                        취소
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || totalRatio !== 100}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                    >
                        <Save size={18} />
                        {loading ? "등록 중..." : "과제 등록"}
                    </button>
                </div>
            </form>
        </div>
    );
}
