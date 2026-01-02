import { StatCard } from "../components/StatCard";

export default function AdminDashboard() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Pending KYC"
        value={12}
        color="yellow"
        href="/admin/kyc"
      />

      <StatCard
        title="Pending Contracts"
        value={5}
        color="indigo"
        href="/admin/contracts"
      />

      <StatCard
        title="Live Businesses"
        value={34}
        color="green"
        href="/admin/businesses"
      />

      <StatCard
        title="Rejected"
        value={7}
        color="red"
        href="/admin/kyc/rejected"
      />
    </div>
  );
}
