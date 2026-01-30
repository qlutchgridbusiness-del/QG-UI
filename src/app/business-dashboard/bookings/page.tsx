"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Spin, Modal, Input, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { playNotificationSound } from "@/utils/sound";

// ---------------- TYPES ----------------
export type BookingStatus =
  | "CREATED"
  | "BUSINESS_ACCEPTED"
  | "SERVICE_STARTED"
  | "SERVICE_COMPLETED"
  | "PAYMENT_PENDING"
  | "PAYMENT_COMPLETED"
  | "VEHICLE_DELIVERED"
  | "REJECTED";

type Booking = {
  id: string;
  status: BookingStatus;
  scheduledAt: string | null;
  createdAt: string;
  priceSnapshot?: number;

  user: {
    name: string;
    phone: string;
  };

  service: {
    name: string;
    durationMinutes?: number;
  };
};

// ---------------- COMPONENT ----------------
export default function BusinessBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");

  const [imageModal, setImageModal] = useState<{
    open: boolean;
    booking: Booking | null;
    type: "START" | "COMPLETE" | null;
  }>({ open: false, booking: null, type: null });

  const [files, setFiles] = useState<File[]>([]);

  // ---------------- POLLING ----------------
  useEffect(() => {
    loadBookings();
    const interval = setInterval(loadBookings, 10000);
    return () => clearInterval(interval);
  }, []);

  function detectStatusChange(prev: Booking[], next: Booking[]) {
    for (const b of next) {
      const old = prev.find((p) => p.id === b.id);
      if (old && old.status !== b.status) {
        playNotificationSound();
        break;
      }
    }
  }

  async function loadBookings() {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/business-bookings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookings((prev) => {
        detectStatusChange(prev, res.data);
        return res.data;
      });
    } catch {
      message.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  // ---------------- ACTIONS ----------------
  async function acceptBooking(id: string) {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/business-bookings/${id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateStatus(id, "BUSINESS_ACCEPTED");
      message.success("Booking accepted");
    } catch {
      message.error("Failed to accept booking");
    }
  }

  async function rejectBooking() {
    if (!rejectingBooking || !rejectReason) {
      message.warning("Provide rejection reason");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/business-bookings/${rejectingBooking.id}/reject`,
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateStatus(rejectingBooking.id, "REJECTED");
      setRejectingBooking(null);
      setRejectReason("");
      message.success("Booking rejected");
    } catch {
      message.error("Failed to reject booking");
    }
  }

  async function submitImages() {
    if (!imageModal.booking || !files.length) {
      message.warning("Upload at least one image");
      return;
    }

    const token = localStorage.getItem("token");
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));

    const endpoint =
      imageModal.type === "START" ? "start-service" : "complete-service";

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/business-bookings/${imageModal.booking.id}/${endpoint}`,
        fd,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateStatus(
        imageModal.booking.id,
        imageModal.type === "START" ? "SERVICE_STARTED" : "SERVICE_COMPLETED"
      );

      message.success(
        imageModal.type === "START" ? "Service started" : "Service completed"
      );

      setFiles([]);
      setImageModal({ open: false, booking: null, type: null });
    } catch {
      message.error("Operation failed");
    }
  }

  function updateStatus(id: string, status: BookingStatus) {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  }

  // ---------------- UI ----------------
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Bookings</h1>

      <div className="space-y-4">
        {bookings.map((b) => (
          <div key={b.id} className="bg-white border rounded-xl p-5 shadow">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{b.service.name}</h3>
                <p className="text-sm text-gray-500">
                  {b.user.name} • {b.user.phone}
                </p>
              </div>
              <span className="px-3 py-1 text-xs rounded-full bg-gray-100">
                {b.status}
              </span>
            </div>

            <div className="mt-4 flex gap-3 flex-wrap">
              {b.status === "CREATED" && (
                <>
                  <button
                    onClick={() => acceptBooking(b.id)}
                    className="btn-green"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => setRejectingBooking(b)}
                    className="btn-red"
                  >
                    Reject
                  </button>
                </>
              )}

              {b.status === "BUSINESS_ACCEPTED" && (
                <button
                  onClick={() =>
                    setImageModal({ open: true, booking: b, type: "START" })
                  }
                  className="btn-indigo"
                >
                  Start Service
                </button>
              )}

              {b.status === "SERVICE_STARTED" && (
                <button
                  onClick={() =>
                    setImageModal({ open: true, booking: b, type: "COMPLETE" })
                  }
                  className="btn-purple"
                >
                  Complete Service
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reject Modal */}
      <Modal
        title="Reject Booking"
        open={!!rejectingBooking}
        onCancel={() => setRejectingBooking(null)}
        onOk={rejectBooking}
        okButtonProps={{ danger: true }}
      >
        <Input.TextArea
          rows={4}
          placeholder="Reason"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>

      {/* Image Upload Modal */}
      <Modal
        title={
          imageModal.type === "START"
            ? "Upload Before Service Images"
            : "Upload After Service Images"
        }
        open={imageModal.open}
        onCancel={() =>
          setImageModal({ open: false, booking: null, type: null })
        }
        footer={null}
      >
        <Upload
          beforeUpload={(file) => {
            setFiles((prev) => [...prev, file]);
            return false;
          }}
          multiple
          listType="picture"
        >
          <Button icon={<UploadOutlined />}>Upload Images</Button>
        </Upload>

        <Button type="primary" className="mt-4 w-full" onClick={submitImages}>
          Submit
        </Button>
      </Modal>
    </div>
  );
}
