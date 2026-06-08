import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Booking from "@/models/Booking";
import Client from "@/models/Client";
import Bill from "@/models/Bill";
import Product from "@/models/Product";
import User from "@/models/User";
import StatCard from "@/components/ui/StatCard";
import { formatPrice, getRoleLabel } from "@/lib/utils";

async function getStats(role: string, userId: string) {
  await connectDB();

  if (role === "hotel_manager") {
    const [totalRooms, availableRooms, activeBookings, totalClients, revenueData, totalEmployees, maintenanceRooms] =
      await Promise.all([
        Room.countDocuments(),
        Room.countDocuments({ status: "available" }),
        Booking.countDocuments({ status: "active" }),
        Client.countDocuments(),
        Booking.aggregate([
          { $match: { status: { $in: ["active", "completed"] } } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
        User.countDocuments(),
        Room.countDocuments({ status: "maintenance" }),
      ]);
    return { totalRooms, availableRooms, activeBookings, totalClients, totalRevenue: revenueData[0]?.total || 0, totalEmployees, maintenanceRooms };
  }

  if (role === "receptionist") {
    const [availableRooms, activeBookings, totalClients, completedBookings] = await Promise.all([
      Room.countDocuments({ status: "available" }),
      Booking.countDocuments({ status: "active" }),
      Client.countDocuments(),
      Booking.countDocuments({ status: "completed" }),
    ]);
    return { availableRooms, activeBookings, totalClients, completedBookings };
  }

  if (role === "restaurant_manager") {
    const [totalProducts, availableProducts, openBills, revenueData, paidBills] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ available: true }),
      Bill.countDocuments({ status: "open" }),
      Bill.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Bill.countDocuments({ status: "paid" }),
    ]);
    return { totalProducts, availableProducts, openBills, totalRevenue: revenueData[0]?.total || 0, paidBills };
  }

  if (role === "waiter") {
    const [openBills, paidBills] = await Promise.all([
      Bill.countDocuments({ createdBy: userId, status: "open" }),
      Bill.countDocuments({ createdBy: userId, status: "paid" }),
    ]);
    return { openBills, paidBills };
  }

  return {};
}

const GREETINGS = ["Good morning", "Good afternoon", "Good evening"];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return GREETINGS[0];
  if (h < 18) return GREETINGS[1];
  return GREETINGS[2];
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role || "";
  const userId = (session?.user as any)?.id || "";
  const stats = await getStats(role, userId) as any;
  const firstName = session?.user?.name?.split(" ")[0] || "";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-7 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium mb-1">{getGreeting()},</p>
          <h1 className="text-3xl font-bold mb-1">{firstName} 👋</h1>
          <p className="text-blue-200">{getRoleLabel(role)} Dashboard</p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -right-4 -bottom-12 w-56 h-56 bg-white/5 rounded-full" />
        <div className="absolute right-32 -top-4 w-20 h-20 bg-white/10 rounded-full" />
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {role === "hotel_manager" && (
            <>
              <StatCard label="Total Rooms"      value={stats.totalRooms}            color="blue"   icon="rooms" />
              <StatCard label="Available Rooms"  value={stats.availableRooms}        color="green"  icon="rooms" />
              <StatCard label="Active Bookings"  value={stats.activeBookings}        color="orange" icon="booking" />
              <StatCard label="Total Clients"    value={stats.totalClients}          color="purple" icon="users" />
              <StatCard label="Total Revenue"    value={formatPrice(stats.totalRevenue)} color="green" icon="revenue" />
              <StatCard label="Staff Members"    value={stats.totalEmployees}        color="blue"   icon="employees" />
            </>
          )}
          {role === "receptionist" && (
            <>
              <StatCard label="Available Rooms"    value={stats.availableRooms}    color="green"  icon="rooms" />
              <StatCard label="Active Bookings"    value={stats.activeBookings}    color="orange" icon="booking" />
              <StatCard label="Total Clients"      value={stats.totalClients}      color="purple" icon="users" />
              <StatCard label="Completed Bookings" value={stats.completedBookings} color="blue"   icon="check" />
            </>
          )}
          {role === "restaurant_manager" && (
            <>
              <StatCard label="Total Products"   value={stats.totalProducts}            color="blue"   icon="products" />
              <StatCard label="Available Items"  value={stats.availableProducts}        color="green"  icon="products" />
              <StatCard label="Open Bills"        value={stats.openBills}               color="orange" icon="bill" />
              <StatCard label="Restaurant Revenue" value={formatPrice(stats.totalRevenue)} color="green" icon="revenue" />
              <StatCard label="Bills Paid"        value={stats.paidBills}               color="purple" icon="check" />
            </>
          )}
          {role === "waiter" && (
            <>
              <StatCard label="My Open Bills"  value={stats.openBills}  color="orange" icon="bill" />
              <StatCard label="My Paid Bills"  value={stats.paidBills}  color="green"  icon="check" />
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {role === "hotel_manager" && (
            <>
              <QuickAction href="/dashboard/bookings" label="New Booking" color="blue" icon="📅" />
              <QuickAction href="/dashboard/clients" label="Add Client" color="purple" icon="👤" />
              <QuickAction href="/dashboard/rooms" label="Manage Rooms" color="green" icon="🏨" />
              <QuickAction href="/dashboard/employees" label="Manage Staff" color="orange" icon="👥" />
            </>
          )}
          {role === "receptionist" && (
            <>
              <QuickAction href="/dashboard/bookings" label="New Booking" color="blue" icon="📅" />
              <QuickAction href="/dashboard/clients" label="Add Client" color="purple" icon="👤" />
              <QuickAction href="/dashboard/rooms" label="View Rooms" color="green" icon="🏨" />
            </>
          )}
          {role === "restaurant_manager" && (
            <>
              <QuickAction href="/dashboard/bills" label="View Bills" color="orange" icon="🧾" />
              <QuickAction href="/dashboard/products" label="Manage Menu" color="blue" icon="🍽️" />
              <QuickAction href="/dashboard/employees" label="Manage Staff" color="purple" icon="👥" />
            </>
          )}
          {role === "waiter" && (
            <>
              <QuickAction href="/dashboard/bills" label="New Bill" color="orange" icon="🧾" />
              <QuickAction href="/dashboard/products" label="View Menu" color="blue" icon="🍽️" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, label, color, icon }: { href: string; label: string; color: string; icon: string }) {
  const colors: Record<string, string> = {
    blue:   "bg-blue-50 hover:bg-blue-100 border-blue-100 text-blue-700",
    green:  "bg-green-50 hover:bg-green-100 border-green-100 text-green-700",
    purple: "bg-purple-50 hover:bg-purple-100 border-purple-100 text-purple-700",
    orange: "bg-orange-50 hover:bg-orange-100 border-orange-100 text-orange-700",
  };
  return (
    <a
      href={href}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all hover:shadow-sm hover:-translate-y-0.5 ${colors[color]}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
    </a>
  );
}
