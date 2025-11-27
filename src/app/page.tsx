"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (search.trim()) {
      router.push(`/user-dashboard?search=${search}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* HERO SECTION */}
      <div className="relative h-[85vh] flex items-center justify-center">
        {/* Background Image */}
        <Image
          src="/hero-bg.png" // Replace with your image
          alt="Hero"
          fill
          className="object-cover brightness-[0.45]"
        />

        {/* Hero Text */}
        <div className="relative z-10 text-center px-4">
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Services at Your Doorstep
          </motion.h1>

          <motion.p
            className="text-lg md:text-2xl text-gray-200 mt-4 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Car care, full service, painting & more — trusted experts in minutes.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-white shadow-xl rounded-full px-4 py-3 flex items-center w-[90%] md:w-[55%]">
              <input
                type="text"
                placeholder="Search for services…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-3 py-2 text-gray-700 outline-none text-lg"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-full transition"
              >
                Search
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* POPULAR CATEGORIES */}
      <section className="py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-10">
          Popular Services
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-6 max-w-5xl mx-auto">
          {[
            { title: "Full Car Service", img: "/cat-service.png" },
            { title: "Car Painting", img: "/cat-painting.png" },
            { title: "Denting", img: "/car-denting.png" },
            { title: "Interior Cleaning", img: "/car-cleaning.png" },
          ].map((c, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-xl shadow-lg p-4 cursor-pointer hover:shadow-2xl transition"
              whileHover={{ scale: 1.04 }}
              onClick={() => router.push(`/user-dashboard?search=${c.title}`)}
            >
              <div className="relative h-32 w-full rounded-lg overflow-hidden mb-3">
                <Image src={c.img} alt={c.title} fill className="object-cover" />
              </div>
              <h3 className="text-center font-semibold">{c.title}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20">
        <h2 className="text-3xl font-bold text-center mb-10">
          Why Choose QlutchGrid?
        </h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-6">
          {[
            {
              title: "Verified Professionals",
              desc: "Trained & background-checked experts for complete peace of mind.",
            },
            {
              title: "Instant Booking",
              desc: "Fast & seamless booking experience—you choose, we deliver.",
            },
            {
              title: "Transparent Pricing",
              desc: "No hidden charges. Honest pricing for every service.",
            },
          ].map((box, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-xl bg-white shadow-lg hover:shadow-2xl transition"
              whileHover={{ y: -4 }}
            >
              <h3 className="text-xl font-semibold mb-3">{box.title}</h3>
              <p className="text-gray-600">{box.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
