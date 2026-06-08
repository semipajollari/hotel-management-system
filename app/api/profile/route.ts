import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const { currentPassword, newPassword, name } = body;

  await connectDB();
  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (name) {
    user.name = name.trim();
  }

  if (currentPassword && newPassword) {
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    if (newPassword.length < 6) return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
    user.password = newPassword;
  }

  await user.save();
  return NextResponse.json({ success: true });
}
