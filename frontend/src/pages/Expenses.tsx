import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Expenses() {
  const { token, activeOrganization } = useAuth();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState("OPERATIONS");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch expenses
  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses", activeOrganization?.id],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/expenses", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "x-organization-id": activeOrganization?.id 
        }
      });
      return res.data;
    },
    enabled: !!activeOrganization?.id
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await axios.post(
        "http://localhost:5000/api/expenses",
        { category, amount, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-organization-id": activeOrganization?.id
          }
        }
      );
      setIsModalOpen(false);
      setCategory("OPERATIONS");
      setAmount("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["expenses", activeOrganization?.id] });
      queryClient.invalidateQueries({ queryKey: ["aiInsights", activeOrganization?.id] });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveReject = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await axios.patch(
        `http://localhost:5000/api/expenses/${id}/approve`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-organization-id": activeOrganization?.id
          }
        }
      );
      queryClient.invalidateQueries({ queryKey: ["expenses", activeOrganization?.id] });
      queryClient.invalidateQueries({ queryKey: ["aiInsights", activeOrganization?.id] });
    } catch (err: any) {
      alert(err.response?.data?.error || `Failed to ${status.toLowerCase()} expense`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Expenses</h1>
          <p className="text-slate-500">Track and manage company expenditures.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Submit Expense</Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading expenses...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Expense ID</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {expenses?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No expenses found.</td>
                </tr>
              ) : (
                expenses?.map((expense: any) => (
                  <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{expense.expenseNumber}</td>
                    <td className="px-6 py-4 text-slate-500">{expense.category}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">${expense.amount?.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        expense.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        expense.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {expense.status === 'PENDING' && (
                        <div className="flex gap-2">
                           <button onClick={() => handleApproveReject(expense.id, "APPROVED")} className="text-xs text-emerald-600 hover:underline">Approve</button>
                           <button onClick={() => handleApproveReject(expense.id, "REJECTED")} className="text-xs text-red-600 hover:underline">Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Submit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-950 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Submit Expense</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            
            {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 rounded-md border border-red-200 dark:border-red-900">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Category</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="OPERATIONS" className="text-slate-900 bg-white">Operations</option>
                  <option value="SALARY" className="text-slate-900 bg-white">Salary</option>
                  <option value="RENT" className="text-slate-900 bg-white">Rent</option>
                  <option value="MARKETING" className="text-slate-900 bg-white">Marketing</option>
                  <option value="MISC" className="text-slate-900 bg-white">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Description / Memo</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Expense"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
