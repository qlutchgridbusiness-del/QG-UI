import Tabs from "@/app/components/Tabs";
import ServicesPage from "./services/page";
import SocialPage from "./social/page";

export default function BusinessDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Business Dashboard</h1>
      <Tabs
        tabs={[
          { label: "Services", content: <ServicesPage /> },
          { label: "Social", content: <SocialPage /> },
        ]}
      />
    </div>
  );
}
