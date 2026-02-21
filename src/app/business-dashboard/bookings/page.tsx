"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Spin, Modal, Input, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { playNotificationSound } from "@/utils/sound";
import { API_BASE } from "@/app/lib/api";

// ---------------- TYPES ----------------
export type BookingStatus =
  | "REQUESTED"
  | "BUSINESS_ACCEPTED"
  | "BUSINESS_REJECTED"
  | "SERVICE_STARTED"
  | "SERVICE_COMPLETED"
  | "PAYMENT_PENDING"
  | "PAYMENT_COMPLETED"
  | "VEHICLE_DELIVERED"
  | "CANCELLED";

type Booking = {
  id: string;
  status: BookingStatus;
  scheduledAt: string | null;
  createdAt: string;
  priceSnapshot?: number;
  quoteAmount?: number | null;
  vehicleBrand?: string | null;
  vehicleType?: string | null;
  vehicleModel?: string | null;

  user: {
    name: string;
    phone: string;
  };

  service: {
    name: string;
    durationMinutes?: number;
    pricingType?: "FIXED" | "RANGE" | "QUOTE";
    price?: number | null;
    minPrice?: number | null;
    maxPrice?: number | null;
  };
};

// ---------------- COMPONENT ----------------
export default function BusinessBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const reminderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPendingCountRef = useRef(0);

  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");

  const [imageModal, setImageModal] = useState<{
    open: boolean;
    booking: Booking | null;
    type: "START" | "COMPLETE" | null;
  }>({ open: false, booking: null, type: null });
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [serviceAmount, setServiceAmount] = useState("");
  const [quoteModal, setQuoteModal] = useState<{
    open: boolean;
    booking: Booking | null;
  }>({ open: false, booking: null });
  const [quoteAmount, setQuoteAmount] = useState("");

  useEffect(() => {
    if (!imageModal.open) {
      setFiles([]);
      setServiceAmount("");
      return;
    }
    // reset on every new modal open to avoid leaking files across bookings/types
    setFiles([]);
    setServiceAmount(
      imageModal.type === "COMPLETE" && imageModal.booking?.quoteAmount
        ? String(imageModal.booking.quoteAmount)
        : ""
    );
  }, [imageModal.open, imageModal.booking?.id, imageModal.type]);

  useEffect(() => {
    if (!quoteModal.open) {
      setQuoteAmount("");
      return;
    }
    setQuoteAmount("");
  }, [quoteModal.open, quoteModal.booking?.id]);

  function detectStatusChange(prev: Booking[], next: Booking[]) {
    for (const b of next) {
      const old = prev.find((p) => p.id === b.id);
      if (old && old.status !== b.status) {
        playNotificationSound();
        break;
      }
    }
  }

  function updateReminder(next: Booking[]) {
    const pending = next.filter((b) => b.status === "REQUESTED");
    const pendingCount = pending.length;

    if (pendingCount > lastPendingCountRef.current) {
      // New booking arrived
      playNotificationSound();
    }

    lastPendingCountRef.current = pendingCount;

    if (pendingCount > 0 && !reminderIntervalRef.current) {
      reminderIntervalRef.current = setInterval(() => {
        playNotificationSound();
      }, 20000);
    }

    if (pendingCount === 0 && reminderIntervalRef.current) {
      clearInterval(reminderIntervalRef.current);
      reminderIntervalRef.current = null;
    }
  }

  async function loadBookings() {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_BASE}/business-bookings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookings((prev) => {
        detectStatusChange(prev, res.data);
        updateReminder(res.data);
        return res.data;
      });
    } catch {
      message.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  // ---------------- POLLING ----------------
  useEffect(() => {
    loadBookings();
    const interval = setInterval(loadBookings, 10000);
    return () => {
      clearInterval(interval);
      if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current);
        reminderIntervalRef.current = null;
      }
    };
  }, []);

  // ---------------- ACTIONS ----------------
  async function acceptBooking(id: string) {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_BASE}/business-bookings/${id}/accept`,
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
        `${API_BASE}/business-bookings/${rejectingBooking.id}/reject`,
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateStatus(rejectingBooking.id, "BUSINESS_REJECTED");
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
    const endpoint =
      imageModal.type === "START" ? "start-service" : "complete-service";

    try {
      // Upload images to get URLs
      const urls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await axios.post(`${API_BASE}/uploads/image`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
        urls.push(res.data.url);
      }

      if (imageModal.type === "START") {
        await axios.put(
          `${API_BASE}/business-bookings/${imageModal.booking.id}/${endpoint}`,
          { beforeImages: urls },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        updateStatus(imageModal.booking.id, "SERVICE_STARTED");
        message.success("Service started");
      } else {
        if (!serviceAmount) {
          message.warning("Enter service amount");
          return;
        }
        await axios.put(
          `${API_BASE}/business-bookings/${imageModal.booking.id}/${endpoint}`,
          { afterImages: urls, amount: Number(serviceAmount) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        updateStatus(imageModal.booking.id, "PAYMENT_PENDING");
        message.success("Service completed");
      }

      setFiles([]);
      setServiceAmount("");
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
          <div
            key={b.id}
            onClick={() => setDetailBooking(b)}
            className="bg-white border rounded-xl p-5 shadow cursor-pointer hover:shadow-md transition"
          >
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
              {b.status === "REQUESTED" && (
                <>
                  {(b.service.pricingType === "RANGE" ||
                    b.service.pricingType === "QUOTE") && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuoteModal({ open: true, booking: b });
                      }}
                      className="btn-indigo"
                    >
                      Send Quote
                    </button>
                  )}
                  {b.service.pricingType === "FIXED" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageModal({ open: true, booking: b, type: "START" });
                      }}
                      className="btn-indigo"
                    >
                      Start Service
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRejectingBooking(b);
                    }}
                    className="btn-red"
                  >
                    Reject
                  </button>
                </>
              )}

              {b.status === "BUSINESS_ACCEPTED" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageModal({ open: true, booking: b, type: "START" });
                  }}
                  className="btn-indigo"
                >
                  Start Service
                </button>
              )}

              {b.status === "SERVICE_STARTED" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageModal({ open: true, booking: b, type: "COMPLETE" });
                  }}
                  className="btn-purple"
                >
                  Complete Service
                </button>
              )}

              {b.status === "PAYMENT_COMPLETED" && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const token = localStorage.getItem("token");
                    await axios.put(
                      `${API_BASE}/business-bookings/${b.id}/deliver`,
                      {},
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    updateStatus(b.id, "VEHICLE_DELIVERED");
                    message.success("Vehicle delivered");
                  }}
                  className="btn-green"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  Mark Delivered
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
        onCancel={() => {
          setImageModal({ open: false, booking: null, type: null });
          setFiles([]);
          setServiceAmount("");
        }}
        footer={null}
        destroyOnClose
      >
        <Upload
          key={`${imageModal.booking?.id ?? "none"}-${imageModal.type ?? "none"}`}
          beforeUpload={(file) => {
            setFiles((prev) => [...prev, file]);
            return false;
          }}
          multiple
          listType="picture"
        >
          <Button icon={<UploadOutlined />}>Upload Images</Button>
        </Upload>

        {imageModal.type === "COMPLETE" && (
          <Input
            className="mt-3"
            placeholder="Service amount (₹)"
            value={serviceAmount}
            onChange={(e) => setServiceAmount(e.target.value)}
          />
        )}

        <Button type="primary" className="mt-4 w-full" onClick={submitImages}>
          Submit
        </Button>
      </Modal>

      {/* Quote Modal */}
      <Modal
        open={quoteModal.open}
        title="Propose Quote"
        onCancel={() => setQuoteModal({ open: false, booking: null })}
        footer={null}
      >
        <div className="space-y-3">
          <Input
            type="number"
            placeholder="Quote amount (₹)"
            value={quoteAmount}
            onChange={(e) => setQuoteAmount(e.target.value)}
          />
          <Button
            type="primary"
            className="w-full"
            onClick={async () => {
              if (!quoteAmount || Number(quoteAmount) <= 0) {
                message.error("Enter a valid quote amount");
                return;
              }
              const token = localStorage.getItem("token");
              if (!token || !quoteModal.booking) return;
              try {
                await axios.put(
                  `${API_BASE}/business-bookings/${quoteModal.booking.id}/quote`,
                  { quoteAmount: Number(quoteAmount) },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                message.success("Quote sent");
                setQuoteModal({ open: false, booking: null });
                loadBookings();
              } catch (e: any) {
                message.error(
                  e?.response?.data?.message || "Failed to send quote"
                );
              }
            }}
          >
            Send Quote
          </Button>
        </div>
      </Modal>

      {/* Booking Details Modal */}
      <Modal
        open={!!detailBooking}
        title="Booking Details"
        onCancel={() => setDetailBooking(null)}
        footer={null}
      >
        {detailBooking && (
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold">Service:</span>{" "}
              {detailBooking.service.name}
            </div>
            <div>
              <span className="font-semibold">Customer:</span>{" "}
              {detailBooking.user.name} • {detailBooking.user.phone}
            </div>
            <div>
              <span className="font-semibold">Status:</span>{" "}
              {detailBooking.status}
            </div>
            {detailBooking.scheduledAt && (
              <div>
                <span className="font-semibold">Scheduled:</span>{" "}
                {new Date(detailBooking.scheduledAt).toLocaleString()}
              </div>
            )}
            {detailBooking.service.pricingType && (
              <div>
                <span className="font-semibold">Pricing:</span>{" "}
                {detailBooking.service.pricingType === "FIXED" &&
                  `₹${detailBooking.service.price ?? 0}`}
                {detailBooking.service.pricingType === "RANGE" &&
                  `₹${detailBooking.service.minPrice ?? 0} – ₹${
                    detailBooking.service.maxPrice ?? 0
                  }`}
                {detailBooking.service.pricingType === "QUOTE" && "Quotation"}
              </div>
            )}
            {detailBooking.quoteAmount ? (
              <div>
                <span className="font-semibold">Quoted:</span> ₹
                {detailBooking.quoteAmount}
              </div>
            ) : null}
            {(detailBooking.vehicleBrand || detailBooking.vehicleType) && (
              <div>
                <span className="font-semibold">Vehicle:</span>{" "}
                {[detailBooking.vehicleBrand, detailBooking.vehicleType]
                  .filter(Boolean)
                  .join(" • ")}
              </div>
            )}
            {detailBooking.vehicleModel && (
              <div>
                <span className="font-semibold">Model:</span>{" "}
                {detailBooking.vehicleModel}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
