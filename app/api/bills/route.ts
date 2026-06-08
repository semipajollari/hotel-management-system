import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Bill from "@/models/Bill";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const role = (session.user as any).role;

  // Waiters see only their own bills; managers see all
  const filter = role === "waiter" ? { createdBy: (session.user as any).id } : {};
  const bills = await Bill.find(filter)
    .populate("createdBy", "name")
    .sort({ createdAt: -1 });
  return NextResponse.json(bills);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const total = body.items.reduce(
    (sum: number, item: { quantity: number; price: number }) => sum + item.quantity * item.price,
    0
  );

  const bill = await Bill.create({
    ...body,
    total,
    createdBy: (session.user as any).id,
  });

  return NextResponse.json(bill, { status: 201 });
}
