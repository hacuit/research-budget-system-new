import { Wallet, TrendingDown, PiggyBank } from "lucide-react";

interface SummaryCardsProps {
    totalBudget: number;
    totalExpenses: number;
    balance: number;
}

export default function SummaryCards({ totalBudget, totalExpenses, balance }: SummaryCardsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">총 연구비</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</h3>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                    <Wallet size={24} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">총 지출액</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</h3>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-red-600">
                    <TrendingDown size={24} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">잔액</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(balance)}</h3>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                    <PiggyBank size={24} />
                </div>
            </div>
        </div>
    );
}
