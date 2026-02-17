"use client";

import { useEffect, useState } from "react";
import { Input, Select, Button, Switch, Spin } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE } from "@/app/lib/api";
import ImageGallery from "@/app/business-dashboard/components/ImageGallery";

const { Option } = Select;

export default function AddServicePage() {
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    pricingType: "FIXED",
    price: undefined as number | undefined,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    durationMinutes: 30,
    available: true,
    images: [] as string[],
  });

  /* ---------------------------
     LOAD BUSINESS ID
  ---------------------------- */
  useEffect(() => {
    async function loadBusiness() {
      try {
        const res = await axios.get(
          `${API_BASE}/business/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.data?.length) {
          alert("No business found");
          router.push("/business-dashboard");
          return;
        }

        setBusinessId(res.data[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadBusiness();
  }, []);

  /* ---------------------------
     SUBMIT SERVICE
  ---------------------------- */
  async function submit() {
    if (!form.name.trim()) {
      alert("Service name is required");
      return;
    }

    setSaving(true);
    try {
      await axios.post(
        `${API_BASE}/business/${businessId}/services`,
        {
          services: [
            {
              name: form.name,
              pricingType: form.pricingType,
              price:
                form.pricingType === "FIXED" ? form.price : undefined,
              minPrice:
                form.pricingType === "RANGE" ? form.minPrice : undefined,
              maxPrice:
                form.pricingType === "RANGE" ? form.maxPrice : undefined,
              durationMinutes: form.durationMinutes,
              available: form.available,
              images: form.images,
            },
          ],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      router.push("/business-dashboard/services");
    } catch (err) {
      console.error(err);
      alert("Failed to add service");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  /* ---------------------------
     UI
  ---------------------------- */
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
        Add New Service
      </h1>

      <Input
        placeholder="Service name (e.g. Full Car Wash)"
        value={form.name}
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
      />

      <Select
        value={form.pricingType}
        className="w-full"
        onChange={(v) =>
          setForm({
            ...form,
            pricingType: v,
            price: undefined,
            minPrice: undefined,
            maxPrice: undefined,
          })
        }
      >
        <Option value="FIXED">Fixed Price</Option>
        <Option value="RANGE">Price Range</Option>
        <Option value="QUOTE">Quotation</Option>
      </Select>

      {form.pricingType === "FIXED" && (
        <Input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: Number(e.target.value) })
          }
        />
      )}

      {form.pricingType === "RANGE" && (
        <>
          <Input
            type="number"
            placeholder="Minimum price"
            value={form.minPrice}
            onChange={(e) =>
              setForm({ ...form, minPrice: Number(e.target.value) })
            }
          />
          <Input
            type="number"
            placeholder="Maximum price"
            value={form.maxPrice}
            onChange={(e) =>
              setForm({ ...form, maxPrice: Number(e.target.value) })
            }
          />
        </>
      )}

      <Input
        type="number"
        placeholder="Duration (minutes)"
        value={form.durationMinutes}
        onChange={(e) =>
          setForm({
            ...form,
            durationMinutes: Number(e.target.value),
          })
        }
      />

      <div className="flex items-center gap-3">
        <Switch
          checked={form.available}
          onChange={(v) => setForm({ ...form, available: v })}
        />
        <span>Available for booking</span>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Service Images</div>
        {form.images.length > 0 && <ImageGallery images={form.images} />}
        <label className="text-xs text-indigo-600 cursor-pointer">
          Upload image
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const fd = new FormData();
                fd.append("file", file);
                const uploadRes = await axios.post(
                  `${API_BASE}/uploads/image`,
                  fd,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                const url = uploadRes.data?.url;
                if (url) {
                  setForm((prev) => ({
                    ...prev,
                    images: [...prev.images, url],
                  }));
                }
              } catch (err) {
                console.error(err);
                alert("Image upload failed");
              }
            }}
          />
        </label>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          type="primary"
          loading={saving}
          onClick={submit}
        >
          Add Service
        </Button>
      </div>
    </div>
  );
}
