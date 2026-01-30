"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Tabs from "@/app/components/Tabs";
import { Button, Spin, Modal, Input } from "antd";
import BusinessServicesPage from "./services/page";
import BusinessSettingsPage from "./settings/page";
import SocialPage from "./social/page";

/* -----------------------------
   Types (based on backend)
------------------------------ */
type Booking = {
  id: string;
  status: "REQUESTED" | "ACCEPTED" | "REJECTED" | "COMPLETED";
  scheduledAt?: string;
  priceSnapshot?: number;
  user: {
    id: string;
    name: string;
    phone: string;
  };
  service: {
    name: string;
    durationMinutes: number;
  };
  business: {
    name: string;
  };
};

/* -----------------------------
   Orders List
------------------------------ */
function OrdersList({
  orders,
  onSelect,
}: {
  orders: Booking[];
  onSelect: (b: Booking) => void;
}) {
  if (!orders.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        No bookings yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((b) => (
        <div
          key={b.id}
          onClick={() => onSelect(b)}
          className="bg-white border rounded-xl p-4 shadow-sm hover:shadow cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">
                {b.service.name}
              </div>
              <div className="text-sm text-gray-500">
                {b.user.name} • {b.user.phone}
              </div>
              <div className="text-xs capitalize text-gray-600">
                {b.status.toLowerCase()}
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold">
                ₹{b.priceSnapshot ?? "-"}
              </div>
              {b.scheduledAt && (
                <div className="text-xs text-gray-500">
                  {new Date(b.scheduledAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* -----------------------------
   Order Details
------------------------------ */
function OrderDetails({
  booking,
  onBack,
  refresh,
}: {
  booking: Booking;
  onBack: () => void;
  refresh: () => void;
}) {
  const token = localStorage.getItem("token");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);

  async function action(type: "accept" | "reject" | "complete") {
    await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/business-bookings/${booking.id}/${type}`,
      type === "reject" ? { reason: rejectReason } : {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    refresh();
    onBack();
  }

  return (
    <div className="bg-white border rounded-xl p-6 shadow">
      <Button onClick={onBack} className="mb-4">
        ← Back
      </Button>

      <h2 className="text-xl font-semibold mb-4">
        Booking Details
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p><b>Customer:</b> {booking.user.name}</p>
          <p><b>Phone:</b> {booking.user.phone}</p>
          <p><b>Service:</b> {booking.service.name}</p>
          <p><b>Duration:</b> {booking.service.durationMinutes} mins</p>
        </div>

        <div>
          <p><b>Status:</b> {booking.status}</p>
          <p><b>Price:</b> ₹{booking.priceSnapshot}</p>
          {booking.scheduledAt && (
            <p>
              <b>Scheduled:</b>{" "}
              {new Date(booking.scheduledAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 mt-6 flex-wrap">
        {booking.status === "REQUESTED" && (
          <>
            <Button
              type="primary"
              onClick={() => action("accept")}
            >
              Accept
            </Button>

            <Button danger onClick={() => setRejectOpen(true)}>
              Reject
            </Button>
          </>
        )}

        {booking.status === "ACCEPTED" && (
          <Button
            type="primary"
            onClick={() => action("complete")}
          >
            Mark Completed
          </Button>
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        title="Reject Booking"
        open={rejectOpen}
        onOk={() => action("reject")}
        onCancel={() => setRejectOpen(false)}
      >
        <Input.TextArea
          placeholder="Reason for rejection"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}

/* -----------------------------
   MAIN DASHBOARD
------------------------------ */
export default function BusinessDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Booking | null>(null);

  async function loadBookings() {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/business-bookings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookings(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const tabs = [
    {
      label: "Overview",
      content: (
        <>
          {/* STATS */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border rounded-xl p-4">
              <p className="text-gray-500">Total</p>
              <h3 className="text-2xl font-semibold">
                {bookings.length}
              </h3>
            </div>

            <div className="bg-white border rounded-xl p-4">
              <p className="text-gray-500">Pending</p>
              <h3 className="text-2xl font-semibold">
                {bookings.filter((b) => b.status === "REQUESTED").length}
              </h3>
            </div>

            <div className="bg-white border rounded-xl p-4">
              <p className="text-gray-500">Revenue</p>
              <h3 className="text-2xl font-semibold">
                ₹ 0
              </h3>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Spin size="large" />
            </div>
          ) : selected ? (
            <OrderDetails
              booking={selected}
              onBack={() => setSelected(null)}
              refresh={loadBookings}
            />
          ) : (
            <OrdersList orders={bookings} onSelect={setSelected} />
          )}
        </>
      ),
    },

    {
      label: "Services",
      content: <BusinessServicesPage/>,
    },

    {
      label: "Social",
      content: <SocialPage />,
    },

    {
      label: "Settings",
      content: <BusinessSettingsPage />,
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">
        Business Dashboard
      </h1>

      <Tabs tabs={tabs} />
    </div>
  );
}
