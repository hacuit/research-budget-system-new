"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { Project, Expense } from "@/types";
import { FolderKanban, Plus, TrendingUp } from "lucide-react";

export default function Home() {
  const { isAuthorized } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthorized) {
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
      // 데이터가 아예 없는 경우에도 로딩을 끝낼 수 있도록 보조
      if (data.length === 0) setLoading(false);
    }, (err) => {
      console.error("Projects load error:", err);
      setLoading(false);
    });

    // 지출 내역 가져오기
    const expensesQuery = query(collection(db, "expenses"));
    const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Expense[];
      setExpenses(data);
      setLoading(false);
    }, (err) => {
      console.error("Expenses load error:", err);
      setLoading(false);
    });

    return () => {
      unsubProjects();
      unsubExpenses();
    };
  }, [isAuthorized]);

  // 전체 통계 계산
  const totalBudget = projects.reduce((sum, p) => sum + p.totalBudget, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBalance = totalBudget - totalSpent;

  // 과제별 지출 계산
  const getProjectExpenses = (projectId: string) => {
    return expenses
      .filter((e) => e.projectId === projectId)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount) + "원";
  };

  if (loading) return <div className="p-8">로딩 중...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-500 mt-1">
          전체 연구과제 예산 현황을 한눈에 확인하세요.
        </p>
      </div>

      {/* 전체 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-1">등록된 과제</p>
          <h3 className="text-3xl font-bold text-gray-900">{projects.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-1">총 연구비</p>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalBudget)}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-1">총 지출</p>
          <h3 className="text-2xl font-bold text-red-600">
            {formatCurrency(totalSpent)}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-1">총 잔액</p>
          <h3 className="text-2xl font-bold text-green-600">
            {formatCurrency(totalBalance)}
          </h3>
        </div>
      </div>

      {/* 과제 목록 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FolderKanban size={20} />
            연구과제 현황
          </h2>
          <Link
            href="/projects/new"
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <Plus size={16} />새 과제 등록
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              등록된 과제가 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              첫 번째 연구과제를 등록해보세요.
            </p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus size={18} />
              과제 등록하기
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">과제명</th>
                  <th className="px-6 py-3">유형</th>
                  <th className="px-6 py-3">지원기관</th>
                  <th className="px-6 py-3 text-right">총액</th>
                  <th className="px-6 py-3 text-right">지출</th>
                  <th className="px-6 py-3 text-right">잔액</th>
                  <th className="px-6 py-3 text-center">집행률</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map((project) => {
                  const spent = getProjectExpenses(project.id);
                  const balance = project.totalBudget - spent;
                  const percent = (spent / project.totalBudget) * 100;

                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          {project.title}
                        </Link>
                        <p className="text-xs text-gray-500">{project.code}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {project.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {project.agency}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                        {formatCurrency(project.totalBudget)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-red-600">
                        {formatCurrency(spent)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-green-600">
                        {formatCurrency(balance)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${percent > 90
                                ? "bg-red-500"
                                : percent > 70
                                  ? "bg-yellow-500"
                                  : "bg-indigo-500"
                                }`}
                              style={{ width: `${Math.min(percent, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 w-12 text-right">
                            {percent.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
