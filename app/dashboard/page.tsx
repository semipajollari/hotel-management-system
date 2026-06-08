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
    const [totalRooms, availableRooms, activeBookings, totalClients, revenueData, totalEmployees] =
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
      ]);
    return { totalRooms, availableRooms, activeBookings, totalClients, totalRevenue: revenueData[0]?.total || 0, totalEmployees };
  }

  if (role === "receptionist") {
    const [availableRooms, activeBookings, totalClients] = await Promise.all([
      Room.countDocuments({ status: "available" }),
      Booking.countDocuments({ status: "active" }),
      Client.countDocuments(),
    ]);
    return { availableRooms, activeBookings, totalClients };
  }

  if (role === "restaurant_manager") {
    const [totalProducts, availableProducts, openBills, revenueData] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ available: true }),
      Bill.countDocuments({ status: "open" }),
      Bill.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    ]);
    return { totalProducts, availableProducts, openBills, totalRevenue: revenueData[0]?.total || 0 };
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

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role || "";
  const userId = (session?.user as any)?.id || "";
  const stats = await getStats(role, userId);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="text-gray-500 mt-1">{getRoleLabel(role)} Dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {role === "hotel_manager" && (
          <>
            <StatCard label="Total Rooms" value={(stats as any).totalRooms} color="blue" />
            <StatCard label="Available Rooms" value={(stats as any).availableRooms} color="green" />
            <StatCard label="Active Bookings" value={(stats as any).activeBookings} color="orange" />
            <StatCard label="Total Clients" value={(stats as any).totalClients} color="purple" />
            <StatCard label="Total Revenue" value={formatPrice((stats as any).totalRevenue)} color="green" />
            <StatCard label="Employees" value={(stats as any).totalEmployees} color="blue" />
          </>
        )}
        {role === "receptionist" && (
          <>
            <StatCard label="Available Rooms" value={(stats as any).availableRooms} color="green" />
            <StatCard label="Active Bookings" value={(stats as any).activeBookings} color="orange" />
            <StatCard label="Total Clients" value={(stats as any).totalClients} color="purple" />
          </>
        )}
        {role === "restaurant_manager" && (
          <>
            <StatCard label="Total Products" value={(stats as any).totalProducts} color="blue" />
            <StatCard label="Available Items" value={(stats as any).availableProducts} color="green" />
            <StatCard label="Open Bills" value={(stats as any).openBills} color="orange" />
            <StatCard label="Total Revenue" value={formatPrice((stats as any).totalRevenue)} color="green" />
          </>
        )}
        {role === "waiter" && (
          <>
            <StatCard label="My Open Bills" value={(stats as any).openBills} color="orange" />
            <StatCard label="My Paid Bills" value={(stats as any).paidBills} color="green" />
          </>
        )}
      </div>
    </div>
  );
}
