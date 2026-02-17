// src/app/contact-us/page.tsx
"use client";

export default function ContactUsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl text-white font-bold">Contact Us</h1>

      <h1 className="text-white">
        Reach out to us for any queries or assistance! We are here to help you with a smile!
      </h1>

      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <p><strong>Service Queries:</strong> services@qlutchgrid.com</p>
        <p><strong>Business Queries:</strong> business@qlutchgrid.com</p>
        <p><strong>Other Queries:</strong> support@qlutchgrid.com</p>
      </div>

      <form className="bg-white rounded-xl shadow p-6 space-y-4">
        <select className="w-full border p-3 rounded-lg">
          <option>Query Type</option>
          <option>Service</option>
          <option>Business</option>
          <option>Support</option>
        </select>

        <input placeholder="Enter Email" className="w-full border p-3 rounded-lg" />
        <input placeholder="Enter Name" className="w-full border p-3 rounded-lg" />
        <input placeholder="Enter Mobile" className="w-full border p-3 rounded-lg" />

        <textarea
          placeholder="Enter Message"
          className="w-full border p-3 rounded-lg min-h-[140px]"
        />

        <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg">
          Submit
        </button>
      </form>
    </div>
  );
}
