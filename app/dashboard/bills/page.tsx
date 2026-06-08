"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import { getStatusBadgeColor, formatDate, formatPrice } from "@/lib/utils";

type Product = { _id: string; name: string; price: number; category: string; available: boolean };
type BillItem = { product: string; productName: string; quantity: number; price: number };
type Bill = {
  _id: string;
  tableNumber: number;
  items: BillItem[];
  total: number;
  status: string;
  createdBy: { name: string };
  createdAt: string;
};

export default function BillsPage() {
  const { data: session } = useSession();
  const isManager = (session?.user as any)?.role === "restaurant_manager";

  const [bills, setBills] = useState<Bill[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailBill, setDetailBill] = useState<Bill | null>(null);
  const [tableNumber, setTableNumber] = useState(1);
  const [items, setItems] = useState<BillItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchAll() {
    const [bRes, pRes] = await Promise.all([fetch("/api/bills"), fetch("/api/products")]);
    const [b, p] = await Promise.all([bRes.json(), pRes.json()]);
    setBills(b);
    setProducts(p.filter((pr: Product) => pr.available));
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  function addItem() {
    const prod = products.find((p) => p._id === selectedProduct);
    if (!prod) return;
    const existing = items.find((i) => i.product === prod._id);
    if (existing) {
      setItems(items.map((i) => i.product === prod._id ? { ...i, quantity: i.quantity + qty } : i));
    } else {
      setItems([...items, { product: prod._id, productName: prod.name, quantity: qty, price: prod.price }]);
    }
    setSelectedProduct("");
    setQty(1);
  }

  function removeItem(productId: string) {
    setItems(items.filter((i) => i.product !== productId));
  }

  const billTotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) { setError("Add at least one item."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber, items }),
      });
      if (!res.ok) throw new Error("Failed to create bill");
      await fetchAll();
      setModalOpen(false);
      setItems([]);
      setTableNumber(1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function markPaid(id: string) {
    await fetch(`/api/bills/${id}`, { method: "PATCH" });
    await fetchAll();
    setDetailBill(null);
  }

  return (
    <div>
      <PageHeader
        title="Bills"
        description="Restaurant bills and orders"
        action={
          !isManager && (
            <button className="btn-primary" onClick={() => { setItems([]); setError(""); setModalOpen(true); }}>
              + New Bill
            </button>
          )
        }
      />

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : bills.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No bills yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Table", "Items", "Total", "Status", "Waiter", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bills.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">Table {b.tableNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{b.items.length} items</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(b.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${getStatusBadgeColor(b.status)}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{b.createdBy?.name}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(b.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setDetailBill(b)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">View</button>
                      {b.status === "open" && isManager && (
                        <button onClick={() => markPaid(b._id)} className="text-green-600 hover:text-green-800 text-xs font-medium">Mark Paid</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Bill Modal */}
      <Modal title="New Bill" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Table Number</label>
            <input type="number" min="1" className="input" value={tableNumber} onChange={(e) => setTableNumber(+e.target.value)} required />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="label">Product</label>
              <select className="input" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} — {formatPrice(p.price)}</option>
                ))}
              </select>
            </div>
            <div className="w-20">
              <label className="label">Qty</label>
              <input type="number" min="1" className="input" value={qty} onChange={(e) => setQty(+e.target.value)} />
            </div>
            <div className="flex items-end">
              <button type="button" className="btn-secondary" onClick={addItem}>Add</button>
            </div>
          </div>

          {items.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs text-gray-500">Item</th>
                    <th className="px-3 py-2 text-right text-xs text-gray-500">Qty</th>
                    <th className="px-3 py-2 text-right text-xs text-gray-500">Total</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.product}>
                      <td className="px-3 py-2">{item.productName}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatPrice(item.quantity * item.price)}</td>
                      <td className="px-3 py-2 text-right">
                        <button type="button" onClick={() => removeItem(item.product)} className="text-red-400 hover:text-red-600 text-xs">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-3 py-2 text-sm font-semibold text-right">Total:</td>
                    <td className="px-3 py-2 text-sm font-bold text-blue-600">{formatPrice(billTotal)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Creating..." : "Create Bill"}</button>
          </div>
        </form>
      </Modal>

      {/* Bill Detail Modal */}
      <Modal title={`Bill — Table ${detailBill?.tableNumber}`} open={!!detailBill} onClose={() => setDetailBill(null)}>
        {detailBill && (
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              <p>Date: {formatDate(detailBill.createdAt)}</p>
              <p>Waiter: {detailBill.createdBy?.name}</p>
              <span className={`badge mt-1 ${getStatusBadgeColor(detailBill.status)}`}>{detailBill.status}</span>
            </div>
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs text-gray-500">Item</th>
                  <th className="px-3 py-2 text-right text-xs text-gray-500">Qty</th>
                  <th className="px-3 py-2 text-right text-xs text-gray-500">Price</th>
                  <th className="px-3 py-2 text-right text-xs text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {detailBill.items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{item.productName}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">{formatPrice(item.price)}</td>
                    <td className="px-3 py-2 text-right">{formatPrice(item.quantity * item.price)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-3 py-2 font-semibold text-right">Total:</td>
                  <td className="px-3 py-2 font-bold text-blue-600">{formatPrice(detailBill.total)}</td>
                </tr>
              </tfoot>
            </table>
            <div className="flex justify-between items-center">
              <button
                className="btn-secondary"
                onClick={() => window.print()}
              >
                Print Bill
              </button>
              {detailBill.status === "open" && isManager && (
                <button className="btn-primary" onClick={() => markPaid(detailBill._id)}>
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
