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
      router.push(`/user-dashboard?search=${encodeURIComponent(search)}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* HERO SECTION */}
      <div className="relative h-[85vh] flex items-center justify-center">
        <Image
          src="/hero-bg.png"
          alt="Hero"
          fill
          priority
          className="object-cover brightness-[0.45]"
        />

        {/* HERO CONTENT */}
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-xl leading-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Services at Your Doorstep
          </motion.h1>

          <motion.p
            className="text-lg md:text-2xl text-gray-200 mt-4 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Car care, full service, painting & more — trusted experts in
            minutes.
          </motion.p>

          {/* SEARCH BAR */}
          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white shadow-lg md:shadow-xl rounded-full px-4 py-3 flex items-center w-[92%] md:w-[60%] border border-gray-100">
              <input
                type="text"
                placeholder="Search for services…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-3 py-1.5 text-gray-700 outline-none text-lg"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded-full transition"
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

        <div className="max-w-5xl mx-auto px-6">
          <div
            className="
      flex gap-6 overflow-x-auto
      snap-x snap-mandatory
      scrollbar-hide
      py-2
    "
          >
            {[
              { title: "Full Car Service", img: "/Untitled 4.png" },
              { title: "Car Painting", img: "/Untitled 12.png" },
              { title: "Interior Cleaning", img: "/Untitled 7.png" },
              { title: "Engine Repair", img: "/Untitled 2.png" },
            ].map((c, i) => (
              <motion.div
                key={i}
                onClick={() => router.push(`/user-dashboard?search=${c.title}`)}
                whileHover={{ scale: 1.04 }}
                className="
          min-w-[70%] sm:min-w-[45%] md:min-w-[22%]
          snap-start
          bg-white rounded-xl shadow-lg
          cursor-pointer overflow-hidden
        "
              >
                <div className="relative h-36 w-full bg-gray-100">
                  <Image
                    src={c.img}
                    alt={c.title}
                    fill
                    className="object-cover hover:scale-105 transition"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose QlutchGrid?
        </h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-6">
          {[
            {
              title: "Verified Professionals",
              img: "/Untitled 16.png",
            },
            {
              title: "Instant Booking",
              img: "/Untitled 14.png",
            },
            {
              title: "Transparent Pricing",
              img: "/Untitled 20.png",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-xl bg-white shadow-lg hover:shadow-2xl transition border border-gray-100 text-center"
              whileHover={{ y: -6, scale: 1.02 }}
            >
              {/* Image */}
              <div className="relative h-36 w-full mb-6 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold">{item.title}</h3>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
