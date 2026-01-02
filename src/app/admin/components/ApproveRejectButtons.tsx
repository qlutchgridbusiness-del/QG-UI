export function ApproveRejectButtons({ onApprove, onReject }) {
  return (
    <div className="flex gap-3 mt-3">
      <button
        onClick={onApprove}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Approve
      </button>
      <button
        onClick={onReject}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Reject
      </button>
    </div>
  );
}
