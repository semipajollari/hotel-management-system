import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import { calculateNights } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const bookings = await Booking.find()
    .populate("client", "firstName lastName email phone")
    .populate("room", "number type price")
    .populate("createdBy", "name")
    .sort({ createdAt: -1 });
  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const { clientId, roomId, checkIn, checkOut, notes } = body;

  const room = await Room.findById(roomId);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (room.status !== "available") return NextResponse.json({ error: "Room is not available" }, { status: 400 });

  const nights = calculateNights(new Date(checkIn), new Date(checkOut));
  const totalPrice = nights * room.price;

  const booking = await Booking.create({
    client: clientId,
    room: roomId,
    checkIn,
    checkOut,
    totalPrice,
    notes,
    createdBy: (session.user as any).id || (session as any).user?.sub,
    status: "active",
  });

  // Mark room as occupied
  await Room.findByIdAndUpdate(roomId, { status: "occupied" });

  const populated = await booking.populate([
    { path: "client", select: "firstName lastName email" },
    { path: "room", select: "number type price" },
  ]);
  return NextResponse.json(populated, { status: 201 });
}
