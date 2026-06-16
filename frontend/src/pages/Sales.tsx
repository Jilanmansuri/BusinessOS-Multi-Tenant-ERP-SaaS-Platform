import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Sales() {
  const { token, activeOrganization } = useAuth();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<Array<{ productId: string; quantity: number; price: number }>>([
    { productId: "", quantity: 1, price: 0 }
  ]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", activeOrganization?.id],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/orders", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "x-organization-id": activeOrganization?.id 
        }
      });
      return res.data;
    },
    enabled: !!activeOrganization?.id
  });

  // Fetch customers
  const { data: customers } = useQuery({
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

  // Fetch products (needed to select items and know their price/stock)
  const { data: products } = useQuery({
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

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === "productId") {
      const product = products?.find((p: any) => p.id === value);
      newItems[index] = {
        productId: value,
        quantity: 1,
        price: product ? product.sellingPrice : 0
      };
    } else if (field === "quantity") {
      newItems[index]!.quantity = Number(value);
    } else if (field === "price") {
      newItems[index]!.price = Number(value);
    }
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!customerId) {
      setError("Please select a customer");
      setSubmitting(false);
      return;
    }

    if (items.some(item => !item.productId || item.quantity <= 0)) {
      setError("Please select a valid product and quantity for all lines");
      setSubmitting(false);
      return;
    }

    // Client-side stock check
    for (const item of items) {
      const product = products?.find((p: any) => p.id === item.productId);
      if (product && product.stock < item.quantity) {
        setError(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
        setSubmitting(false);
        return;
      }
    }

    try {
      await axios.post(
        "http://localhost:5000/api/orders",
        { customerId, items },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-organization-id": activeOrganization?.id
          }
        }
      );
      setIsModalOpen(false);
      setCustomerId("");
      setItems([{ productId: "", quantity: 1, price: 0 }]);
      queryClient.invalidateQueries({ queryKey: ["orders", activeOrganization?.id] });
      queryClient.invalidateQueries({ queryKey: ["products", activeOrganization?.id] }); // Invalidate products too because stock decrements!
      queryClient.invalidateQueries({ queryKey: ["aiInsights", activeOrganization?.id] });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sales Orders</h1>
          <p className="text-slate-500">Manage customer orders and track fulfillment.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Create Order</Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading orders...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {orders?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No orders found.</td>
                </tr>
              ) : (
                orders?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-slate-500">{order.customer?.name || "Unknown"}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">${order.total?.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                         order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                         order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                         order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                         'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-950 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Sales Order</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            
            {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 rounded-md border border-red-200 dark:border-red-900">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Customer</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="" className="text-slate-900 bg-white">Select Customer</option>
                  {customers?.map((cust: any) => (
                    <option key={cust.id} value={cust.id} className="text-slate-900 bg-white">
                      {cust.name} ({cust.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Items List</h3>
                  <button type="button" onClick={handleAddItem} className="text-xs text-blue-600 font-medium hover:underline">+ Add Line Item</button>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-end border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex-1">
                        <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Product</label>
                        <select
                          required
                          className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                        >
                          <option value="" className="text-slate-900 bg-white">Select Product</option>
                          {products?.map((prod: any) => (
                            <option key={prod.id} value={prod.id} className="text-slate-900 bg-white">
                              {prod.name} (Stock: {prod.stock})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-20">
                        <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Qty</label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        />
                      </div>

                      <div className="w-24">
                        <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, "price", e.target.value)}
                        />
                      </div>

                      <div className="flex items-center text-xs font-semibold text-slate-900 dark:text-white py-2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>

                      {items.length > 1 && (
                        <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 text-xs py-2">Delete</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Grand Total</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">${calculateTotal().toFixed(2)}</span>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Order"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
