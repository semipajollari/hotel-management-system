"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import { getStatusBadgeColor, formatPrice } from "@/lib/utils";

type Room = {
  _id: string;
  number: string;
  type: string;
  price: number;
  capacity: number;
  status: string;
  floor: number;
  description: string;
};

const EMPTY: Omit<Room, "_id"> = {
  number: "", type: "single", price: 0, capacity: 1, status: "available", floor: 1, description: "",
};

export default function RoomsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const isManager = role === "hotel_manager";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchRooms() {
    const res = await fetch("/api/rooms");
    const data = await res.json();
    setRooms(data);
    setLoading(false);
  }

  useEffect(() => { fetchRooms(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setModalOpen(true);
  }

  function openEdit(room: Room) {
    setEditing(room);
    const { _id, ...rest } = room;
    setForm(rest);
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = editing ? `/api/rooms/${editing._id}` : "/api/rooms";
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
      await fetchRooms();
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this room?")) return;
    await fetch(`/api/rooms/${id}`, { method: "DELETE" });
    setRooms((prev) => prev.filter((r) => r._id !== id));
  }

  return (
    <div>
      <PageHeader
        title="Rooms"
        description="Manage hotel rooms and availability"
        action={
          isManager && (
            <button className="btn-primary" onClick={openCreate}>
              + Add Room
            </button>
          )
        }
      />

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : rooms.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No rooms yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Room #", "Type", "Floor", "Price/Night", "Capacity", "Status", isManager ? "Actions" : ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rooms.map((room) => (
                <tr key={room._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{room.number}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{room.type}</td>
                  <td className="px-4 py-3 text-gray-600">{room.floor}</td>
                  <td className="px-4 py-3 text-gray-600">{formatPrice(room.price)}</td>
                  <td className="px-4 py-3 text-gray-600">{room.capacity}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${getStatusBadgeColor(room.status)}`}>{room.status}</span>
                  </td>
                  {isManager && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(room)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                        <button onClick={() => handleDelete(room._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal title={editing ? "Edit Room" : "Add Room"} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Room Number</label>
              <input className="input" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} required />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {["single", "double", "suite", "deluxe"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Price/Night (ALL)</label>
              <input type="number" min="0" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} required />
            </div>
            <div>
              <label className="label">Capacity</label>
              <input type="number" min="1" max="10" className="input" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} required />
            </div>
            <div>
              <label className="label">Floor</label>
              <input type="number" min="1" className="input" value={form.floor} onChange={(e) => setForm({ ...form, floor: +e.target.value })} required />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {["available", "occupied", "maintenance"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
