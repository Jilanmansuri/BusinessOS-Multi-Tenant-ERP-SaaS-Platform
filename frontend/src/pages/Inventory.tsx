import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package } from "lucide-react";

export default function Inventory() {
  const { token, activeOrganization } = useAuth();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [reorderLevel, setReorderLevel] = useState("5");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", activeOrganization?.id],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/products", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "x-organization-id": activeOrganization?.id 
        }
      });
      return res.data;
    },
    enabled: !!activeOrganization?.id
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories", activeOrganization?.id],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/categories", {
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

    if (!categoryId) {
      setError("Please select a category");
      setSubmitting(false);
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/products",
        { name, sku, stock, costPrice, sellingPrice, reorderLevel, categoryId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-organization-id": activeOrganization?.id
          }
        }
      );
      setIsModalOpen(false);
      setName("");
      setSku("");
      setStock("");
      setCostPrice("");
      setSellingPrice("");
      setReorderLevel("5");
      setCategoryId("");
      queryClient.invalidateQueries({ queryKey: ["products", activeOrganization?.id] });
      queryClient.invalidateQueries({ queryKey: ["aiInsights", activeOrganization?.id] }); // Refresh CFO AI insights as well!
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const lowStockProducts = products?.filter((p: any) => p.stock <= p.reorderLevel) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory</h1>
          <p className="text-slate-500">Manage products, SKUs, and stock levels.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Add Product</Button>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-red-500 shrink-0" />
          <div>
            <h3 className="text-red-800 dark:text-red-300 font-medium">Low Stock Alert</h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {lowStockProducts.length} product(s) are at or below their reorder level. Please restock soon.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading inventory...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Product / SKU</th>
                <th className="px-6 py-3 font-medium">Cost Price</th>
                <th className="px-6 py-3 font-medium">Selling Price</th>
                <th className="px-6 py-3 font-medium">Margin</th>
                <th className="px-6 py-3 font-medium">Stock</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {products?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No products found.</td>
                </tr>
              ) : (
                products?.map((product: any) => (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <Package size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{product.name}</div>
                          <div className="text-xs text-slate-500">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">${product.costPrice?.toFixed(2)}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">${product.sellingPrice?.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-600 font-medium">+{product.profitMargin?.toFixed(1)}%</span>
                    </td>
                    <td className="px-6 py-4 font-medium">{product.stock}</td>
                    <td className="px-6 py-4">
                      {product.stock === 0 ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Out of Stock</span>
                      ) : product.stock <= product.reorderLevel ? (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">Low Stock</span>
                      ) : (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">In Stock</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-950 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            
            {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 rounded-md border border-red-200 dark:border-red-900">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Reorder Level</label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Category</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="" className="text-slate-900 bg-white">Select Category</option>
                    {categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.id} className="text-slate-900 bg-white">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding..." : "Add Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
