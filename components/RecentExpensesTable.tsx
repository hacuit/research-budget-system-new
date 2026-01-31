interface Expense {
    id: string;
    category: string;
    description: string;
    amount: number;
    date: string;
}

interface RecentExpensesTableProps {
    expenses: Expense[];
}

export default function RecentExpensesTable({ expenses }: RecentExpensesTableProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">최근 지출 내역</h3>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                    전체 보기
                </button>
            </div>
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
                                <td className="px-6 py-4 text-sm text-gray-600">{expense.date}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{expense.description}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
        </div>
    );
}
