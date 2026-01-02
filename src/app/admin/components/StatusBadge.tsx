export function StatusBadge({ status }) {
  const map = {
    KYC_SUBMITTED: "yellow",
    APPROVED: "blue",
    ACTIVE: "green",
    REJECTED: "red",
  };

  return (
    <span
      className={`px-3 py-1 text-xs rounded-full bg-${map[status]}-100 text-${map[status]}-700`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
