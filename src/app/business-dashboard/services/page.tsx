"use client";
import { useState, useEffect } from "react";
import { Button, Spin, message } from "antd";
import AddServiceModal from "../components/AddServiceModal";
import ServiceList from "../components/ServiceList";
import axios from "axios";

export default function ServicesPage() {
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const token = localStorage.getItem("token");

        if (!user?.id) {
          message.error("User not logged in");
          setLoading(false);
          return;
        }

        // 1️⃣ Fetch all businesses and find one where ownerId === user.id
        const businessRes = await axios.get("http://localhost:5001/business", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const allBusinesses = businessRes.data || [];
        const currentBusiness = allBusinesses?.businesses?.find(
          (b: any) => b.b_ownerId === user.id
        );

        if (!currentBusiness) {
          message.warning("No business found for this user");
          setLoading(false);
          return;
        }

        // 2️⃣ Fetch services for that business
        const serviceRes = await axios.get(
          `http://localhost:5001/business/${currentBusiness.b_id}/services`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setServices(serviceRes.data.services || []);
      } catch (error) {
        console.error("Error fetching services:", error);
        message.error("Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Your Services</h2>
        <Button onClick={() => setOpen(true)}>+ Add Service</Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : (
        <ServiceList services={services} />
      )}

      <AddServiceModal
        open={open}
        onClose={() => setOpen(false)}
        setServices={setServices}
      />
    </div>
  );
}
