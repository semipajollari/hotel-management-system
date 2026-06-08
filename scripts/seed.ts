/**
 * Seed script — populates the database with demo data.
 * Run: npm run seed
 * Requires .env.local with MONGODB_URI set.
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI not found in environment");
  process.exit(1);
}

// ----- Inline schemas to keep seed self-contained -----
const UserSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String,
}, { timestamps: true });
const RoomSchema = new mongoose.Schema({
  number: String, type: String, price: Number, capacity: Number,
  status: { type: String, default: "available" }, floor: Number, description: String,
}, { timestamps: true });
const ClientSchema = new mongoose.Schema({
  firstName: String, lastName: String, email: String,
  phone: String, idNumber: String, nationality: String,
}, { timestamps: true });
const ProductSchema = new mongoose.Schema({
  name: String, category: String, price: Number, available: Boolean, description: String,
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
const Room = mongoose.model("Room", RoomSchema);
const Client = mongoose.model("Client", ClientSchema);
const Product = mongoose.model("Product", ProductSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Room.deleteMany({}),
    Client.deleteMany({}),
    Product.deleteMany({}),
  ]);

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // --- Users (employees) ---
  await User.create([
    { name: "Artan Koci", email: "manager@hotel.com", password: await hash("password123"), role: "hotel_manager" },
    { name: "Blerina Hoxha", email: "restaurant@hotel.com", password: await hash("password123"), role: "restaurant_manager" },
    { name: "Drita Gjoka", email: "receptionist@hotel.com", password: await hash("password123"), role: "receptionist" },
    { name: "Erjon Mema", email: "waiter@hotel.com", password: await hash("password123"), role: "waiter" },
    { name: "Fatmira Leka", email: "waiter2@hotel.com", password: await hash("password123"), role: "waiter" },
  ]);

  // --- Rooms ---
  await Room.create([
    { number: "101", type: "single", price: 4500, capacity: 1, floor: 1, status: "available", description: "Cozy single room with city view" },
    { number: "102", type: "single", price: 4500, capacity: 1, floor: 1, status: "occupied", description: "Cozy single room" },
    { number: "103", type: "double", price: 7000, capacity: 2, floor: 1, status: "available", description: "Comfortable double room" },
    { number: "201", type: "double", price: 7500, capacity: 2, floor: 2, status: "available", description: "Double room with sea view" },
    { number: "202", type: "double", price: 7500, capacity: 2, floor: 2, status: "maintenance", description: "Under renovation" },
    { number: "203", type: "deluxe", price: 12000, capacity: 3, floor: 2, status: "available", description: "Spacious deluxe room" },
    { number: "301", type: "suite", price: 20000, capacity: 4, floor: 3, status: "available", description: "Luxury suite with panoramic view" },
    { number: "302", type: "suite", price: 20000, capacity: 4, floor: 3, status: "occupied", description: "Luxury suite" },
  ]);

  // --- Clients ---
  await Client.create([
    { firstName: "Gjergji", lastName: "Shehu", email: "gjergji@email.com", phone: "+355 69 123 4567", idNumber: "AL12345678", nationality: "Albanian" },
    { firstName: "Maria", lastName: "Rossi", email: "maria.rossi@email.it", phone: "+39 333 123 4567", idNumber: "IT98765432", nationality: "Italian" },
    { firstName: "John", lastName: "Smith", email: "j.smith@email.com", phone: "+44 7700 900123", idNumber: "GB55551234", nationality: "British" },
    { firstName: "Ana", lastName: "Popescu", email: "ana.p@email.ro", phone: "+40 721 234 567", idNumber: "RO11223344", nationality: "Romanian" },
  ]);

  // --- Restaurant Products ---
  await Product.create([
    // Food
    { name: "Grilled Chicken", category: "food", price: 1200, available: true, description: "Free-range chicken with herbs" },
    { name: "Pasta Carbonara", category: "food", price: 900, available: true, description: "Traditional Italian recipe" },
    { name: "Caesar Salad", category: "food", price: 700, available: true, description: "Romaine lettuce, croutons, parmesan" },
    { name: "Beef Steak", category: "food", price: 2500, available: true, description: "250g prime beef, medium-rare" },
    { name: "Veggie Burger", category: "food", price: 800, available: false, description: "Currently unavailable" },
    // Drinks
    { name: "Fresh Orange Juice", category: "drink", price: 350, available: true, description: "Freshly squeezed" },
    { name: "Espresso", category: "drink", price: 150, available: true, description: "Double shot" },
    { name: "House Wine (Glass)", category: "drink", price: 500, available: true, description: "Red or white" },
    { name: "Sparkling Water", category: "drink", price: 200, available: true, description: "500ml bottle" },
    // Desserts
    { name: "Tiramisu", category: "dessert", price: 600, available: true, description: "Classic Italian dessert" },
    { name: "Chocolate Cake", category: "dessert", price: 550, available: true, description: "Warm with ice cream" },
    { name: "Fruit Salad", category: "dessert", price: 400, available: true, description: "Seasonal fruits" },
  ]);

  console.log("Seed completed successfully!");
  console.log("\nDemo accounts:");
  console.log("  manager@hotel.com       — Hotel Manager");
  console.log("  restaurant@hotel.com    — Restaurant Manager");
  console.log("  receptionist@hotel.com  — Receptionist");
  console.log("  waiter@hotel.com        — Waiter");
  console.log("  Password for all: password123\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
