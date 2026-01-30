import PaymentVerified from "../../components/PaymentVerified";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <PaymentVerified
          title="QlutchGrid Verified"
          subtitle="Your payment was successful and your business plan is now active."
        />
      </div>
    </div>
  );
}
