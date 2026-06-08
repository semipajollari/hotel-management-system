"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import { formatPrice } from "@/lib/utils";

type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  description: string;
};

const EMPTY: Omit<Product, "_id"> = { name: "", category: "food", price: 0, available: true, description: "" };
const CATEGORY_COLORS: Record<string, string> = {
  food: "bg-orange-100 text-orange-800",
  drink: "bg-blue-100 text-blue-800",
  dessert: "bg-pink-100 text-pink-800",
};

export default function ProductsPage() {
  const { data: session } = useSession();
  const isManager = (session?.user as any)?.role === "restaurant_manager";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "_id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  async function fetchProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => { fetchProducts(); }, []);

  function openCreate() { setEditing(null); setForm(EMPTY); setError(""); setModalOpen(true); }
  function openEdit(p: Product) {
    setEditing(p);
    const { _id, ...rest } = p;
    setForm(rest);
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = editing ? `/api/products/${editing._id}` : "/api/products";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      await fetchProducts();
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p._id !== id));
  }

  const filtered = filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <div>
      <PageHeader
        title={isManager ? "Products / Menu" : "Menu"}
        description="Restaurant menu items"
        action={
          isManager && (
            <button className="btn-primary" onClick={openCreate}>+ Add Product</button>
          )
        }
      />

      {/* Category filter */}
      <div className="flex gap-2 mb-4">
        {["all", "food", "drink", "dessert"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium capitalize transition-colors ${
              filter === cat ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <p className="col-span-3 text-center text-gray-400 py-8">Loading...</p>}
        {!loading && filtered.length === 0 && (
          <p className="col-span-3 text-center text-gray-400 py-8">No products found.</p>
        )}
        {filtered.map((p) => (
          <div key={p._id} className={`card p-5 ${!p.available ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between mb-2">
              <span className={`badge ${CATEGORY_COLORS[p.category]}`}>{p.category}</span>
              {!p.available && <span className="badge bg-gray-100 text-gray-500">Unavailable</span>}
            </div>
            <h3 className="font-semibold text-gray-900 mt-2">{p.name}</h3>
            {p.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
            <div className="flex items-center justify-between mt-4">
              <span className="text-lg font-bold text-blue-600">{formatPrice(p.price)}</span>
              {isManager && (
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                  <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal title={editing ? "Edit Product" : "Add Product"} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {["food", "drink", "dessert"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Price (ALL)</label>
              <input type="number" min="0" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="avail" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} className="rounded" />
            <label htmlFor="avail" className="text-sm text-gray-700">Available</label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
