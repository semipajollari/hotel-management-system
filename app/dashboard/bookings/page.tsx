"use client";
import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import { getStatusBadgeColor, formatDate, formatPrice, calculateNights } from "@/lib/utils";

type Booking = {
  _id: string;
  client: { _id: string; firstName: string; lastName: string; email: string };
  room: { _id: string; number: string; type: string; price: number };
  checkIn: string;
  checkOut: string;
  status: string;
  totalPrice: number;
  notes: string;
  createdAt: string;
};
type Client = { _id: string; firstName: string; lastName: string };
type Room = { _id: string; number: string; type: string; price: number; status: string };

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ clientId: "", roomId: "", checkIn: "", checkOut: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{ nights: number; total: number } | null>(null);

  async function fetchAll() {
    const [bRes, cRes, rRes] = await Promise.all([
      fetch("/api/bookings"),
      fetch("/api/clients"),
      fetch("/api/rooms"),
    ]);
    const [b, c, r] = await Promise.all([bRes.json(), cRes.json(), rRes.json()]);
    setBookings(b);
    setClients(c);
    setAvailableRooms(r.filter((room: Room) => room.status === "available"));
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (form.roomId && form.checkIn && form.checkOut) {
      const room = availableRooms.find((r) => r._id === form.roomId);
      if (room) {
        const nights = calculateNights(new Date(form.checkIn), new Date(form.checkOut));
        setPreview({ nights, total: nights * room.price });
      }
    } else {
      setPreview(null);
    }
  }, [form.roomId, form.checkIn, form.checkOut, availableRooms]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      await fetchAll();
      setModalOpen(false);
      setForm({ clientId: "", roomId: "", checkIn: "", checkOut: "", notes: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Cancel this booking?")) return;
    const res = await fetch(`/api/bookings/${id}`, { method: "PATCH" });
    if (res.ok) await fetchAll();
  }

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="Manage room reservations"
        action={
          <button className="btn-primary" onClick={() => { setError(""); setModalOpen(true); }}>
            + New Booking
          </button>
        }
      />

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No bookings yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Client", "Room", "Check-in", "Check-out", "Total", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{b.client?.firstName} {b.client?.lastName}</p>
                    <p className="text-xs text-gray-400">{b.client?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">#{b.room?.number}</p>
                    <p className="text-xs text-gray-400 capitalize">{b.room?.type}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(b.checkIn)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(b.checkOut)}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{formatPrice(b.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${getStatusBadgeColor(b.status)}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {b.status === "active" && (
                      <button onClick={() => handleCancel(b._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal title="New Booking" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Client</label>
            <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required>
              <option value="">Select a client...</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Room</label>
            <select className="input" value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} required>
              <option value="">Select an available room...</option>
              {availableRooms.map((r) => (
                <option key={r._id} value={r._id}>#{r.number} — {r.type} ({formatPrice(r.price)}/night)</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Check-in</label>
              <input type="date" className="input" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} required />
            </div>
            <div>
              <label className="label">Check-out</label>
              <input type="date" className="input" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} required />
            </div>
          </div>
          {preview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm">
              <span className="text-blue-700 font-medium">{preview.nights} nights</span>
              <span className="text-blue-600"> — Total: {formatPrice(preview.total)}</span>
            </div>
          )}
          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Booking..." : "Book"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
