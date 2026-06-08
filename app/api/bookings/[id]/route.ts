import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Room from "@/models/Room";

// Cancel a booking
export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const booking = await Booking.findById(params.id);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.status !== "active") return NextResponse.json({ error: "Booking is not active" }, { status: 400 });

  booking.status = "cancelled";
  await booking.save();

  // Free the room
  await Room.findByIdAndUpdate(booking.room, { status: "available" });

  return NextResponse.json(booking);
}
