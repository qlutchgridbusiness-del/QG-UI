import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
