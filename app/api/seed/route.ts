import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Room from "@/models/Room";
import Client from "@/models/Client";
import Product from "@/models/Product";
import bcrypt from "bcryptjs";

// One-time seed endpoint — protected by a secret token.
// Call once after deploy: GET /api/seed?token=YOUR_SEED_SECRET
// Add SEED_SECRET to your Vercel environment variables.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!process.env.SEED_SECRET || token !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Check if already seeded
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    return NextResponse.json({ message: "Already seeded. Pass ?reset=true to re-seed.", count: existingUsers });
  }

  const reset = req.nextUrl.searchParams.get("reset") === "true";
  if (reset) {
    await Promise.all([
      User.deleteMany({}),
      Room.deleteMany({}),
      Client.deleteMany({}),
      Product.deleteMany({}),
    ]);
  }

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  await User.create([
    { name: "Artan Koci", email: "manager@hotel.com", password: await hash("password123"), role: "hotel_manager" },
    { name: "Blerina Hoxha", email: "restaurant@hotel.com", password: await hash("password123"), role: "restaurant_manager" },
    { name: "Drita Gjoka", email: "receptionist@hotel.com", password: await hash("password123"), role: "receptionist" },
    { name: "Erjon Mema", email: "waiter@hotel.com", password: await hash("password123"), role: "waiter" },
    { name: "Fatmira Leka", email: "waiter2@hotel.com", password: await hash("password123"), role: "waiter" },
  ]);

  await Room.create([
    { number: "101", type: "single",  price: 4500,  capacity: 1, floor: 1, status: "available",   description: "Cozy single room with city view" },
    { number: "102", type: "single",  price: 4500,  capacity: 1, floor: 1, status: "occupied",    description: "Cozy single room" },
    { number: "103", type: "double",  price: 7000,  capacity: 2, floor: 1, status: "available",   description: "Comfortable double room" },
    { number: "201", type: "double",  price: 7500,  capacity: 2, floor: 2, status: "available",   description: "Double room with sea view" },
    { number: "202", type: "double",  price: 7500,  capacity: 2, floor: 2, status: "maintenance", description: "Under renovation" },
    { number: "203", type: "deluxe",  price: 12000, capacity: 3, floor: 2, status: "available",   description: "Spacious deluxe room" },
    { number: "301", type: "suite",   price: 20000, capacity: 4, floor: 3, status: "available",   description: "Luxury suite with panoramic view" },
    { number: "302", type: "suite",   price: 20000, capacity: 4, floor: 3, status: "occupied",    description: "Luxury suite" },
  ]);

  await Client.create([
    { firstName: "Gjergji", lastName: "Shehu",   email: "gjergji@email.com",    phone: "+355 69 123 4567", idNumber: "AL12345678", nationality: "Albanian" },
    { firstName: "Maria",   lastName: "Rossi",   email: "maria.rossi@email.it", phone: "+39 333 123 4567", idNumber: "IT98765432", nationality: "Italian" },
    { firstName: "John",    lastName: "Smith",   email: "j.smith@email.com",    phone: "+44 7700 900123",  idNumber: "GB55551234", nationality: "British" },
    { firstName: "Ana",     lastName: "Popescu", email: "ana.p@email.ro",       phone: "+40 721 234 567",  idNumber: "RO11223344", nationality: "Romanian" },
  ]);

  await Product.create([
    { name: "Grilled Chicken",      category: "food",    price: 1200, available: true,  description: "Free-range chicken with herbs" },
    { name: "Pasta Carbonara",      category: "food",    price: 900,  available: true,  description: "Traditional Italian recipe" },
    { name: "Caesar Salad",         category: "food",    price: 700,  available: true,  description: "Romaine lettuce, croutons, parmesan" },
    { name: "Beef Steak",           category: "food",    price: 2500, available: true,  description: "250g prime beef, medium-rare" },
    { name: "Veggie Burger",        category: "food",    price: 800,  available: false, description: "Currently unavailable" },
    { name: "Fresh Orange Juice",   category: "drink",   price: 350,  available: true,  description: "Freshly squeezed" },
    { name: "Espresso",             category: "drink",   price: 150,  available: true,  description: "Double shot" },
    { name: "House Wine (Glass)",   category: "drink",   price: 500,  available: true,  description: "Red or white" },
    { name: "Sparkling Water",      category: "drink",   price: 200,  available: true,  description: "500ml bottle" },
    { name: "Tiramisu",             category: "dessert", price: 600,  available: true,  description: "Classic Italian dessert" },
    { name: "Chocolate Cake",       category: "dessert", price: 550,  available: true,  description: "Warm with ice cream" },
    { name: "Fruit Salad",          category: "dessert", price: 400,  available: true,  description: "Seasonal fruits" },
  ]);

  return NextResponse.json({
    success: true,
    message: "Database seeded successfully!",
    created: { users: 5, rooms: 8, clients: 4, products: 12 },
    accounts: [
      "manager@hotel.com — Hotel Manager",
      "restaurant@hotel.com — Restaurant Manager",
      "receptionist@hotel.com — Receptionist",
      "waiter@hotel.com — Waiter",
      "Password for all: password123",
    ],
  });
}
