"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addDoc, collection, serverTimestamp, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { Project, BUDGET_CATEGORIES, CATEGORY_COLORS } from "@/types";
import { Calendar, CreditCard, FileText, DollarSign, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ExpensesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedProjectId = searchParams.get("projectId");

    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const [formData, setFormData] = useState({
        projectId: preselectedProjectId || "",
        date: new Date().toISOString().split("T")[0],
        category: BUDGET_CATEGORIES[0],
        amount: "",
        description: "",
    });

    // 과제 목록 가져오기
    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Project[];
            setProjects(data);

            // 미리 선택된 과제가 있으면 설정
            if (preselectedProjectId) {
                const found = data.find((p) => p.id === preselectedProjectId);
                if (found) {
                    setSelectedProject(found);
                    setFormData((prev) => ({ ...prev, projectId: found.id }));
                }
            }
        });

        return () => unsub();
    }, [user, preselectedProjectId]);

    // 과제 선택 시 상세 정보 업데이트
    const handleProjectChange = (projectId: string) => {
        const project = projects.find((p) => p.id === projectId);
        setSelectedProject(project || null);
        setFormData({ ...formData, projectId });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert("로그인이 필요합니다.");
        if (!formData.projectId) return alert("과제를 선택해주세요.");

        setLoading(true);
        try {
            await addDoc(collection(db, "expenses"), {
                ...formData,
                amount: Number(formData.amount),
                userId: user.uid,
                createdAt: serverTimestamp(),
            });
            alert("지출이 등록되었습니다!");

            // 해당 과제 상세 페이지로 이동
            router.push(`/projects/${formData.projectId}`);
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
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                {preselectedProjectId && (
                    <Link
                        href={`/projects/${preselectedProjectId}`}
                        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft size={18} />
                        과제로 돌아가기
                    </Link>
                )}
                <h1 className="text-2xl font-bold text-gray-900">지출 등록</h1>
                <p className="text-gray-500 mt-1">
                    연구비 사용 내역을 입력해주세요.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 과제 선택 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            과제 선택 *
                        </label>
                        {projects.length === 0 ? (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                                등록된 과제가 없습니다.{" "}
                                <Link href="/projects/new" className="underline font-medium">
                                    과제를 먼저 등록해주세요
                                </Link>
                            </div>
                        ) : (
                            <select
                                required
                                value={formData.projectId}
                                onChange={(e) => handleProjectChange(e.target.value)}
                                className="block w-full rounded-lg border-gray-200 border p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">과제를 선택하세요</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.title} ({project.code})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* 선택된 과제의 비목별 잔액 표시 */}
                    {selectedProject && selectedProject.budgetAllocation && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-3">
                                비목별 배정액
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {BUDGET_CATEGORIES.map((cat) => (
                                    <div
                                        key={cat}
                                        className="flex justify-between text-sm p-2 bg-white rounded border border-gray-100"
                                    >
                                        <span
                                            className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[cat] || "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {cat}
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(selectedProject.budgetAllocation[cat] || 0)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 날짜 입력 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            지출 일자 *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Calendar size={18} />
                            </div>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) =>
                                    setFormData({ ...formData, date: e.target.value })
                                }
                                className="pl-10 block w-full rounded-lg border-gray-200 border p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* 비목 선택 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            비목 *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <CreditCard size={18} />
                            </div>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData({ ...formData, category: e.target.value })
                                }
                                className="pl-10 block w-full rounded-lg border-gray-200 border p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                            >
                                {BUDGET_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 적요 입력 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            사용 내역 (적요) *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FileText size={18} />
                            </div>
                            <input
                                type="text"
                                required
                                placeholder="예: 실험용 시약 구매"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                className="pl-10 block w-full rounded-lg border-gray-200 border p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* 금액 입력 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            금액 (원) *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <DollarSign size={18} />
                            </div>
                            <input
                                type="number"
                                required
                                min="0"
                                placeholder="0"
                                value={formData.amount}
                                onChange={(e) =>
                                    setFormData({ ...formData, amount: e.target.value })
                                }
                                className="pl-10 block w-full rounded-lg border-gray-200 border p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        {Number(formData.amount) > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                                = {formatCurrency(Number(formData.amount))}
                            </p>
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading || projects.length === 0}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            {loading ? "등록 중..." : "지출 등록하기"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
