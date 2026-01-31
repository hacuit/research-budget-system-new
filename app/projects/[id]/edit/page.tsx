"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import {
    PROJECT_TYPES,
    AGENCIES,
    BUDGET_CATEGORIES,
    BudgetAllocation,
    Project,
} from "@/types";
import { ArrowLeft, Save, Calculator } from "lucide-react";
import Link from "next/link";

export default function EditProjectPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;
    const [loading, setLoading] = useState(true);

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
        startDate: "",
        endDate: "",
        totalBudget: "",
        directCostRatio: "80",
    });

    const [budgetRatios, setBudgetRatios] = useState<Record<string, string>>({
        인건비: "0",
        학생인건비: "0",
        재료비: "0",
        연구활동비: "0",
        연구수당: "0",
    });

    // 데이터 로드
    useEffect(() => {
        if (!projectId) return;

        const fetchProject = async () => {
            try {
                const docRef = doc(db, "projects", projectId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as Project;
                    setFormData({
                        title: data.title,
                        code: data.code,
                        type: data.type,
                        agency: data.agency,
                        startDate: data.startDate,
                        endDate: data.endDate,
                        totalBudget: data.totalBudget.toString(),
                        directCostRatio: data.directCostRatio.toString(),
                    });

                    // 비율 역산 (대략적인 값)
                    const directCost = (data.totalBudget * data.directCostRatio) / 100;
                    const newRatios: Record<string, string> = {};
                    BUDGET_CATEGORIES.forEach(cat => {
                        const amount = data.budgetAllocation[cat] || 0;
                        // 비율 계산 (소수점 첫째자리까지만)
                        const ratio = directCost > 0 ? (amount / directCost) * 100 : 0;
                        newRatios[cat] = ratio.toFixed(0);
                    });
                    setBudgetRatios(newRatios);
                } else {
                    alert("과제를 찾을 수 없습니다.");
                    router.push("/projects");
                }
            } catch (error) {
                console.error("Error fetching project:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId, router]);


    const totalBudgetNum = Number(formData.totalBudget) || 0;
    const directCost = (totalBudgetNum * Number(formData.directCostRatio)) / 100;

    const totalRatio = Object.values(budgetRatios).reduce(
        (sum, r) => sum + (Number(r) || 0),
        0
    );

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
        // 비율 합계 검증 완화 (소수점 문제 등으로 99~101 사이면 허용하거나, 정확히 100을 요구할 수도 있음)
        // 여기서는 정확히 100을 요구하되 사용자가 조정하게 함
        if (Math.abs(totalRatio - 100) > 0.1)
            return alert("비목별 비율 합계가 100%가 되어야 합니다.");

        setLoading(true);
        try {
            const docRef = doc(db, "projects", projectId);
            await updateDoc(docRef, {
                ...formData,
                totalBudget: Number(formData.totalBudget),
                directCostRatio: Number(formData.directCostRatio),
                budgetAllocation: calculateBudgetAllocation(),
                updatedAt: serverTimestamp(),
            });
            alert("과제가 수정되었습니다!");
            router.push(`/projects/${projectId}`);
        } catch (error) {
            console.error(error);
            alert("수정 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ko-KR").format(amount) + "원";
    };

    if (loading) return <div className="p-8">로딩 중...</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <Link
                    href={`/projects/${projectId}`}
                    className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft size={18} />
                    돌아가기
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">과제 수정</h1>
                <p className="text-gray-500 mt-1">
                    과제 정보를 수정합니다.
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
                                className={`text-sm font-medium ${Math.abs(totalRatio - 100) < 0.1 ? "text-green-600" : "text-red-600"
                                    }`}
                            >
                                합계: {totalRatio}% {Math.abs(totalRatio - 100) < 0.1 ? "✓" : "(100% 필요)"}
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
                <div className="flex justify-end gap-4 pb-20 md:pb-0">
                    <Link
                        href={`/projects/${projectId}`}
                        className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                        취소
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || Math.abs(totalRatio - 100) > 0.1}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                    >
                        <Save size={18} />
                        {loading ? "저장 중..." : "수정 완료"}
                    </button>
                </div>
            </form>
        </div>
    );
}
