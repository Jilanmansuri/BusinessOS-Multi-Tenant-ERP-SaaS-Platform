import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Customers() {
  const { token, activeOrganization } = useAuth();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch customers
  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", activeOrganization?.id],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/customers", {
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
        "http://localhost:5000/api/customers",
        { name, email, phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-organization-id": activeOrganization?.id
          }
        }
      );
      setIsModalOpen(false);
      setName("");
      setEmail("");
      setPhone("");
      queryClient.invalidateQueries({ queryKey: ["customers", activeOrganization?.id] });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create customer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customers</h1>
          <p className="text-slate-500">Manage your client base and view their lifetime value.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Add Customer</Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading customers...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {customers?.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No customers found.</td>
                </tr>
              ) : (
                customers?.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{customer.name}</td>
                    <td className="px-6 py-4 text-slate-500">{customer.email}</td>
                    <td className="px-6 py-4 text-slate-500">{customer.phone || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-950 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Customer</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            
            {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 rounded-md border border-red-200 dark:border-red-900">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Phone</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding..." : "Add Customer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
