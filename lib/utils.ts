import { differenceInDays } from "date-fns";

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "ALL" }).format(amount);
}

export function calculateNights(checkIn: Date, checkOut: Date): number {
  return Math.max(1, differenceInDays(new Date(checkOut), new Date(checkIn)));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    hotel_manager: "bg-purple-100 text-purple-800",
    restaurant_manager: "bg-orange-100 text-orange-800",
    receptionist: "bg-blue-100 text-blue-800",
    waiter: "bg-green-100 text-green-800",
  };
  return colors[role] || "bg-gray-100 text-gray-800";
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    hotel_manager: "Hotel Manager",
    restaurant_manager: "Restaurant Manager",
    receptionist: "Receptionist",
    waiter: "Waiter",
  };
  return labels[role] || role;
}

export function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    available: "bg-green-100 text-green-800",
    occupied: "bg-red-100 text-red-800",
    maintenance: "bg-yellow-100 text-yellow-800",
    active: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
    open: "bg-orange-100 text-orange-800",
    paid: "bg-green-100 text-green-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
