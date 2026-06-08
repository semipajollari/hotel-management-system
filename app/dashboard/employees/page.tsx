"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import { getRoleLabel, getRoleBadgeColor, formatDate } from "@/lib/utils";

type Employee = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

const EMPTY = { name: "", email: "", password: "", role: "receptionist" };

export default function EmployeesPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchEmployees() {
    const res = await fetch("/api/employees");
    const data = await res.json();
    setEmployees(data);
    setLoading(false);
  }

  useEffect(() => { fetchEmployees(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      await fetchEmployees();
      setModalOpen(false);
      setForm(EMPTY);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this employee?")) return;
    await fetch(`/api/employees/${id}`, { method: "DELETE" });
    setEmployees((prev) => prev.filter((e) => e._id !== id));
  }

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage staff accounts"
        action={
          <button className="btn-primary" onClick={() => { setForm(EMPTY); setError(""); setModalOpen(true); }}>
            + Add Employee
          </button>
        }
      />

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : employees.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No employees yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Name", "Email", "Role", "Added", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp) => (
                <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{emp.name}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${getRoleBadgeColor(emp.role)}`}>{getRoleLabel(emp.role)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(emp.createdAt)}</td>
                  <td className="px-4 py-3">
                    {emp._id !== currentUserId && (
                      <button onClick={() => handleDelete(emp._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Remove</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal title="Add Employee" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="hotel_manager">Hotel Manager</option>
              <option value="restaurant_manager">Restaurant Manager</option>
              <option value="receptionist">Receptionist</option>
              <option value="waiter">Waiter</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Adding..." : "Add Employee"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
