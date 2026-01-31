// 과제 정보 타입
export interface Project {
    id: string;
    title: string;              // 과제명
    code: string;               // 과제 코드 (예: 2024R1A1A1234567)
    type: string;               // 과제 유형
    agency: string;             // 지원기관
    startDate: string;          // 시작일
    endDate: string;            // 종료일
    totalBudget: number;        // 총 연구비
    directCostRatio: number;    // 직접비 비율 (%)
    budgetAllocation: BudgetAllocation; // 비목별 배정액
    createdAt?: Date;
    userId?: string;
}

// 비목별 배정액
export interface BudgetAllocation {
    인건비: number;
    학생인건비: number;
    재료비: number;
    연구활동비: number;
    연구수당: number;
    [key: string]: number;      // 추가 비목 허용
}

// 지출 내역 타입
export interface Expense {
    id: string;
    projectId: string;          // 연결된 과제 ID
    category: string;           // 비목
    amount: number;             // 금액
    date: string;               // 지출일
    description: string;        // 적요
    createdAt?: Date;
    userId?: string;
}

// 과제 유형 옵션
export const PROJECT_TYPES: string[] = [
    "기초연구",
    "응용연구",
    "개발연구",
    "인력양성",
    "기타",
];

// 지원기관 옵션
export const AGENCIES: string[] = [
    "한국연구재단",
    "산업통상자원부",
    "과학기술정보통신부",
    "중소벤처기업부",
    "교육부",
    "기타",
];

// 기본 비목 목록
export const BUDGET_CATEGORIES: string[] = [
    "인건비",
    "학생인건비",
    "재료비",
    "연구활동비",
    "연구수당",
];

// 비목별 색상 (UI용)
export const CATEGORY_COLORS: Record<string, string> = {
    인건비: "bg-blue-100 text-blue-800",
    학생인건비: "bg-purple-100 text-purple-800",
    재료비: "bg-green-100 text-green-800",
    연구활동비: "bg-yellow-100 text-yellow-800",
    연구수당: "bg-pink-100 text-pink-800",
};
