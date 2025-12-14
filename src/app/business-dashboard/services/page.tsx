"use client";

import { useState, useEffect } from "react";
import { Button, Spin, message } from "antd";
import AddServiceModal from "../components/AddServiceModal";
import ServiceList from "../components/ServiceList";
import axios from "axios";
import Image from "next/image";

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

        // Fetch business
        const businessRes = await axios.get("http://44.210.135.75:5001/business", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const currentBusiness = businessRes.data?.businesses?.find(
          (b: any) => b.b_ownerId === user.id
        );

        if (!currentBusiness) {
          message.warning("No business found for this user");
          setLoading(false);
          return;
        }

        // Fetch services
        const serviceRes = await axios.get(
          `http://44.210.135.75:5001/business/${currentBusiness.b_id}/services`,
          { headers: { Authorization: `Bearer ${token}` } }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Services</h2>
        <Button
          type="primary"
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Add Service
        </Button>
      </div>

      {/* Banner */}
      <div className="relative h-48 rounded-xl overflow-hidden shadow-lg bg-gray-200">
        <Image
          src="/services-banner.jpg"
          alt="Services Banner"
          fill
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <h3 className="text-white text-xl md:text-2xl font-semibold drop-shadow">
            Showcase Your Expert Services
          </h3>
        </div>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center text-gray-500 text-lg py-10">
          No services added yet.
        </div>
      ) : (
        <ServiceList services={services} />
      )}

      {/* Add Modal */}
      <AddServiceModal open={open} onClose={() => setOpen(false)} setServices={setServices} />
    </div>
  );
}
