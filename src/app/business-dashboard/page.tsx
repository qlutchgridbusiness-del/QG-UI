"use client";

import { useState, useEffect } from "react";
import Tabs from "@/app/components/Tabs";
import ServicesPage from "./services/page";
import SocialPage from "./social/page";
import { Button, Spin } from "antd";
import axios from "axios";
import Image from "next/image";
import { ArrowRightOutlined } from "@ant-design/icons";
import BusinessSettingsPage from "./settings/page";

/* --------------------------
   ORDER LIST COMPONENT
--------------------------- */
function OrdersList({ orders, onOpenOrder }: any) {
  if (!orders?.length)
    return (
      <div className="p-6 text-center text-gray-500">
        No orders yet for your business.
      </div>
    );

  return (
    <div className="space-y-3">
      {orders.map((order: any) => (
        <div
          key={order.id}
          className="bg-white rounded-xl p-4 shadow border hover:shadow-lg cursor-pointer transition"
          onClick={() => onOpenOrder(order)}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Order #{order.id}</h3>
              <p className="text-gray-500 text-sm">{order.customerName}</p>
              <p className="text-gray-600 text-sm capitalize">{order.status}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-lg">₹{order.total}</p>
              <ArrowRightOutlined className="text-gray-400 text-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------
   ORDER DETAILS COMPONENT
--------------------------- */
function OrderDetails({ order, onBack }: any) {
  if (!order) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border">
      <Button onClick={onBack} className="mb-4">
        ← Back to Orders
      </Button>

      <h2 className="text-2xl font-semibold mb-3">
        Order #{order.id}
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mt-4">
        <div className="border p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">Customer Info</h3>
          <p><b>Name:</b> {order.customerName}</p>
          <p><b>Phone:</b> {order.phone}</p>
          <p><b>Address:</b> {order.address}</p>
        </div>

        <div className="border p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">Status</h3>
          <p className="capitalize">{order.status}</p>

          <div className="flex gap-2 mt-3 flex-wrap">
            {["assigned", "in-progress", "completed"].map((s) => (
              <Button
                key={s}
                type={order.status === s ? "primary" : "default"}
                onClick={() => order.updateStatus(s)}
              >
                {s.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 border p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">Services</h3>
          {order.items?.map((item: any, i: number) => (
            <div
              key={i}
              className="flex justify-between py-2 border-b last:border-none"
            >
              <span>
                {item.name} × {item.qty}
              </span>
              <span>₹{item.price}</span>
            </div>
          ))}

          <div className="flex justify-between mt-4 font-semibold text-lg">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------
   BUSINESS DASHBOARD PAGE
--------------------------- */
export default function BusinessDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const businessRes = await axios.get("http://44.210.135.75:5001/business", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allBusinesses = businessRes.data?.businesses || [];
      const currentBusiness = allBusinesses.find(
        (b: any) => b.b_ownerId === user.id
      );

      if (!currentBusiness) {
        setLoadingOrders(false);
        return;
      }

      const orderRes = await axios.get(
        `http://44.210.135.75:5001/orders/business/${currentBusiness.b_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(orderRes.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const tabs = [
    {
      label: "Overview",
      content: (
        <div>
          {/* Top Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl shadow border">
              <p className="text-gray-500">Total Orders</p>
              <h3 className="text-3xl font-semibold">{orders.length}</h3>
            </div>

            <div className="bg-white p-5 rounded-xl shadow border">
              <p className="text-gray-500">Active Orders</p>
              <h3 className="text-3xl font-semibold">
                {orders.filter((o) => o.status !== "completed").length}
              </h3>
            </div>

            <div className="bg-white p-5 rounded-xl shadow border">
              <p className="text-gray-500">Revenue</p>
              <h3 className="text-3xl font-semibold">
                ₹
                {orders.reduce((sum, o) => sum + (o.total || 0), 0)}
              </h3>
            </div>
          </div>

          {/* Orders Preview */}
          <h2 className="text-xl font-semibold mb-4">Latest Orders</h2>

          {loadingOrders ? (
            <div className="flex justify-center py-10">
              <Spin size="large" />
            </div>
          ) : (
            <OrdersList
              orders={orders}
              onOpenOrder={(order: any) =>
                setSelectedOrder({
                  ...order,
                  updateStatus: (status: any) => {
                    axios.put(
                      `http://44.210.135.75:5001/orders/${order.id}/status`,
                      { status },
                      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                    );
                    setOrders((prev) =>
                      prev.map((o) =>
                        o.id === order.id ? { ...o, status } : o
                      )
                    );
                    setSelectedOrder((prev: any) => ({ ...prev, status }));
                  },
                })
              }
            />
          )}

          {selectedOrder && (
            <OrderDetails
              order={selectedOrder}
              onBack={() => setSelectedOrder(null)}
            />
          )}
        </div>
      ),
    },

    { label: "Services", content: <ServicesPage /> },

    { label: "Social", content: <SocialPage /> },
    { label: "Settings", content: <BusinessSettingsPage /> }, // NEW TAB

  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">Business Dashboard</h1>

      <Tabs tabs={tabs} />
    </div>
  );
}
