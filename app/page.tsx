import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-400 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-wide">Grand Hotel</span>
          </div>
          <Link
            href="/login"
            className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-5 py-2 rounded-lg text-sm transition-all shadow-lg hover:shadow-amber-400/30"
          >
            Sign In →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            ✦ Luxury &amp; Comfort Since 2015
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Grand Hotel<br />
            <span className="text-amber-400">Tirana</span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience unparalleled luxury in the heart of the city. Where every detail is crafted for your perfect stay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-8 py-4 rounded-xl text-base transition-all shadow-xl hover:shadow-amber-400/40 hover:-translate-y-0.5"
            >
              Access Dashboard
            </Link>
            <a
              href="#features"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all backdrop-blur-sm hover:-translate-y-0.5"
            >
              Discover More ↓
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2 animate-bounce">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-amber-500 font-semibold text-sm uppercase tracking-widest mb-3">Our Services</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Grand Hotel?</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              From luxurious accommodations to exceptional dining, we offer everything for a perfect stay.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Luxury Rooms",
                desc: "Each room is meticulously designed with premium furnishings and modern amenities for maximum comfort and relaxation.",
                img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
                icon: "🛏️",
              },
              {
                title: "Fine Dining",
                desc: "Savor exquisite dishes crafted by our world-class chefs using the finest local and imported seasonal ingredients.",
                img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
                icon: "🍽️",
              },
              {
                title: "Premium Service",
                desc: "Our dedicated team is available 24/7 to ensure your every need is met with warmth, care, and professionalism.",
                img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
                icon: "⭐",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-52 overflow-hidden">
                  <img
                    src={f.img}
                    alt={f.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Luxury Rooms", value: "50+" },
              { label: "Guest Rating", value: "4.9★" },
              { label: "Years of Excellence", value: "10+" },
              { label: "Happy Guests", value: "5,000+" },
            ].map((s) => (
              <div key={s.label} className="group">
                <p className="text-4xl font-bold text-amber-400 mb-2 group-hover:scale-110 transition-transform">{s.value}</p>
                <p className="text-gray-400 text-sm uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Types */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-amber-500 font-semibold text-sm uppercase tracking-widest mb-3">Accommodations</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Room Types</h2>
            <p className="text-gray-500 text-lg">Choose from our selection of carefully curated accommodations</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                type: "Single",
                price: "4,500 ALL / night",
                img: "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=600&q=80",
                tag: "Perfect for solo travelers",
                badge: "Popular",
              },
              {
                type: "Double",
                price: "7,000 ALL / night",
                img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80",
                tag: "Ideal for couples",
                badge: "Best Value",
              },
              {
                type: "Deluxe",
                price: "12,000 ALL / night",
                img: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
                tag: "Extra space &amp; comfort",
                badge: null,
              },
              {
                type: "Suite",
                price: "20,000 ALL / night",
                img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80",
                tag: "The ultimate experience",
                badge: "Luxury",
              },
            ].map((r) => (
              <div key={r.type} className="group rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={r.img}
                    alt={r.type}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {r.badge && (
                    <div className="absolute top-3 right-3 bg-amber-400 text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full">
                      {r.badge}
                    </div>
                  )}
                  <div className="absolute bottom-3 left-4">
                    <span className="text-white font-bold text-xl">{r.type}</span>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-xs text-gray-400 mb-1">{r.tag}</p>
                  <p className="font-bold text-amber-600 text-sm">{r.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="relative py-28 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gray-900/75" />
        <div className="relative z-10 text-center text-white max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4">Ready to Manage Your Hotel?</h2>
          <p className="text-gray-300 mb-10 text-lg leading-relaxed">
            Access the complete hotel management dashboard to manage rooms, bookings, restaurant, and staff — all in one place.
          </p>
          <Link
            href="/login"
            className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-10 py-4 rounded-xl text-base inline-block transition-all shadow-xl hover:shadow-amber-400/40 hover:-translate-y-0.5"
          >
            Sign In to Dashboard →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-white font-bold">Grand Hotel Tirana</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <span>Bulevardi Dëshmorët e Kombit, Tiranë</span>
              <span>+355 4 123 4567</span>
              <span>info@grandhotel.al</span>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-600 text-sm">© 2025 Grand Hotel Tirana. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
