import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Room from "@/models/Room";

// Cancel or check out a booking
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json().catch(() => ({}));
  const action: "cancel" | "checkout" = body.action || "cancel";

  const booking = await Booking.findById(params.id);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.status !== "active") return NextResponse.json({ error: "Booking is not active" }, { status: 400 });

  booking.status = action === "checkout" ? "completed" : "cancelled";
  await booking.save();

  // Free the room in both cases
  await Room.findByIdAndUpdate(booking.room, { status: "available" });

  return NextResponse.json(booking);
}
