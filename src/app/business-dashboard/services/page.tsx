"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Input, Select, Switch, Spin } from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/app/lib/api";
import ImageGallery from "@/app/business-dashboard/components/ImageGallery";

const { Option } = Select;

type Service = {
  id: string;
  name: string;
  pricingType: "FIXED" | "RANGE" | "QUOTE";
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  durationMinutes?: number;
  available: boolean;
  images?: string[];
};

export default function BusinessServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* ------------------------
     LOAD BUSINESS SERVICES
  ------------------------- */
  async function loadServices() {
    setLoading(true);
    try {
      // 1️⃣ Get my business
      const businessRes = await axios.get(
        `${API_BASE}/business/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const business =
        businessRes.data?.businesses?.[0] ??
        businessRes.data?.[0] ??
        businessRes.data;
      if (!business) {
        setServices([]);
        return;
      }

      // 2️⃣ Get services for business
      const servicesRes = await axios.get(
        `${API_BASE}/business/${business.id}/services`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setServices(servicesRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  /* ------------------------
     SAVE SERVICE (EDIT)
  ------------------------- */
  async function saveService() {
    if (!editing) return;
    setSaving(true);

    try {
      await axios.put(
        `${API_BASE}/business/services/${editing.id}`,
        editing,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadServices();
      setEditing(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function uploadServiceImage(service: Service, file: File) {
    if (!token || !file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await axios.post(`${API_BASE}/uploads/image`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = uploadRes.data?.url;
      if (!url) return;
      const images = [...(service.images || []), url];
      await axios.put(
        `${API_BASE}/business/services/${service.id}`,
        { images },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadServices();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  /* ------------------------
     UI
  ------------------------- */
  return (
    <div className="space-y-6">
      <Button
        type="primary"
        onClick={() => router.push("/business-dashboard/services/add")}
      >
        + Add Service
      </Button>

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
        Services
      </h2>

      {services.length === 0 && (
        <div className="text-gray-500 dark:text-slate-400">
          No services added yet. Add from registration or settings.
        </div>
      )}

      {/* SERVICE LIST */}
      <div className="space-y-4">
        {services.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                {s.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {s.pricingType === "FIXED" && `₹${s.price}`}
                {s.pricingType === "RANGE" && `₹${s.minPrice} – ₹${s.maxPrice}`}
                {s.pricingType === "QUOTE" && "Quotation"}
                {s.durationMinutes && ` • ${s.durationMinutes} mins`}
              </p>
              {s.images && s.images.length > 0 && (
                <div className="mt-2">
                  <ImageGallery images={s.images} />
                </div>
              )}
              <label className="mt-2 inline-block text-xs text-indigo-600 cursor-pointer">
                Upload image
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadServiceImage(s, file);
                  }}
                />
              </label>
            </div>

            <div className="flex items-center gap-4">
              <Switch
                checked={s.available}
                onChange={async (checked) => {
                  await axios.put(
                    `${API_BASE}/business/services/${s.id}`,
                    { available: checked },
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );
                  loadServices();
                }}
              />

              <Button onClick={() => setEditing(s)}>Edit</Button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      <Modal
        open={!!editing}
        title="Edit Service"
        onCancel={() => setEditing(null)}
        onOk={saveService}
        confirmLoading={saving}
      >
        {editing && (
          <div className="space-y-4">
            <Input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Service name"
            />

            <Select
              value={editing.pricingType}
              onChange={(v) =>
                setEditing({
                  ...editing,
                  pricingType: v,
                  price: undefined,
                  minPrice: undefined,
                  maxPrice: undefined,
                })
              }
              className="w-full"
            >
              <Option value="FIXED">Fixed</Option>
              <Option value="RANGE">Range</Option>
              <Option value="QUOTE">Quotation</Option>
            </Select>

            {editing.pricingType === "FIXED" && (
              <Input
                type="number"
                placeholder="Price"
                value={editing.price}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    price: Number(e.target.value),
                  })
                }
              />
            )}

            {editing.pricingType === "RANGE" && (
              <>
                <Input
                  type="number"
                  placeholder="Min price"
                  value={editing.minPrice}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      minPrice: Number(e.target.value),
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Max price"
                  value={editing.maxPrice}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      maxPrice: Number(e.target.value),
                    })
                  }
                />
              </>
            )}

            <Input
              type="number"
              placeholder="Duration (minutes)"
              value={editing.durationMinutes}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  durationMinutes: Number(e.target.value),
                })
              }
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
