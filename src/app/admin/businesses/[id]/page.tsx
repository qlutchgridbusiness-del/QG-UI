import { ApproveRejectButtons } from "../../components/ApproveRejectButtons";

export default function BusinessDetailPage() {
  const business = {}; // fetch by id

  return (
    <div className="space-y-6">
      {/* Business Info */}
      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-2">Business Info</h2>
        <p>Name: {business.name}</p>
        <p>Phone: {business.phone}</p>
        <p>Email: {business.email}</p>
      </section>

      {/* KYC */}
      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-2">KYC</h2>
        <p>PAN: {business.pancard}</p>
        <p>Aadhaar: XXXX XXXX {business.aadhaarLast4}</p>

        <ApproveRejectButtons
          onApprove={() => {}}
          onReject={() => {}}
        />
      </section>

      {/* Services */}
      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-2">Services</h2>
        {business.services.map((s) => (
          <div key={s.id} className="border-b py-2">
            {s.name} – ₹{s.minPrice}–₹{s.maxPrice}
          </div>
        ))}
      </section>

      {/* Final Action */}
      <section className="flex justify-end gap-3">
        <button className="px-4 py-2 border rounded">
          Reject Application
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded">
          Activate Business
        </button>
      </section>
    </div>
  );
}
