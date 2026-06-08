import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Booking from "@/models/Booking";
import Client from "@/models/Client";
import Bill from "@/models/Bill";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const role = (session.user as any).role;

  if (role === "hotel_manager") {
    const [totalRooms, availableRooms, activeBookings, totalClients, totalRevenue, totalEmployees] =
      await Promise.all([
        Room.countDocuments(),
        Room.countDocuments({ status: "available" }),
        Booking.countDocuments({ status: "active" }),
        Client.countDocuments(),
        Booking.aggregate([{ $match: { status: { $in: ["active", "completed"] } } }, { $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
        User.countDocuments(),
      ]);
    return NextResponse.json({
      totalRooms, availableRooms, activeBookings, totalClients,
      totalRevenue: totalRevenue[0]?.total || 0, totalEmployees,
    });
  }

  if (role === "receptionist") {
    const [availableRooms, activeBookings, totalClients] = await Promise.all([
      Room.countDocuments({ status: "available" }),
      Booking.countDocuments({ status: "active" }),
      Client.countDocuments(),
    ]);
    return NextResponse.json({ availableRooms, activeBookings, totalClients });
  }

  if (role === "restaurant_manager") {
    const [totalProducts, availableProducts, openBills, paidBillsRevenue] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ available: true }),
      Bill.countDocuments({ status: "open" }),
      Bill.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    ]);
    return NextResponse.json({
      totalProducts, availableProducts, openBills,
      totalRevenue: paidBillsRevenue[0]?.total || 0,
    });
  }

  if (role === "waiter") {
    const userId = (session.user as any).id;
    const [myOpenBills, myPaidBills] = await Promise.all([
      Bill.countDocuments({ createdBy: userId, status: "open" }),
      Bill.countDocuments({ createdBy: userId, status: "paid" }),
    ]);
    return NextResponse.json({ myOpenBills, myPaidBills });
  }

  return NextResponse.json({});
}
