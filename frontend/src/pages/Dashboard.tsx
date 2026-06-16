import { useAuth } from "../hooks/useAuth";
import { Users, DollarSign, Activity, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function Dashboard() {
  const { activeOrganization, token } = useAuth();

  const { data: aiData, isLoading: aiLoading } = useQuery({
    queryKey: ["aiInsights", activeOrganization?.id],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/ai/insights", {
        headers: { Authorization: `Bearer ${token}`, "x-organization-id": activeOrganization?.id }
      });
      return res.data;
    },
    enabled: !!activeOrganization?.id
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome to {activeOrganization?.name}. Here is what's happening today.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value="$45,231.89" icon={<DollarSign size={20} />} trend="+20.1% from last month" />
        <KPICard title="Total Employees" value="124" icon={<Users size={20} />} trend="+4 from last month" />
        <KPICard title="Active Products" value="573" icon={<Package size={20} />} trend="+21 from last month" />
        <KPICard title="Monthly Expenses" value="$12,430.00" icon={<Activity size={20} />} trend="-4% from last month" />
      </div>

      {/* Advanced Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">AI CFO Assistant Insights</h2>
          {aiLoading ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg animate-pulse h-32"></div>
          ) : (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2">
              {aiData?.insights?.map((insight: string, idx: number) => (
                <p key={idx} className="flex items-start gap-2">
                  <span className="text-lg">✨</span>
                  <span>{insight}</span>
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <ActivityItem title="John added Product A" time="2 minutes ago" />
            <ActivityItem title="Sarah created Order #123" time="1 hour ago" />
            <ActivityItem title="Mike approved Expense #32" time="3 hours ago" />
            <ActivityItem title="Emily joined organization" time="1 day ago" />
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className="text-slate-400 bg-slate-100 dark:bg-slate-800 p-2 rounded-md">{icon}</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
        <p className="text-xs text-slate-500 mt-1">{trend}</p>
      </div>
    </div>
  );
}

function ActivityItem({ title, time }: { title: string, time: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</p>
        <p className="text-xs text-slate-500">{time}</p>
      </div>
    </div>
  );
}
