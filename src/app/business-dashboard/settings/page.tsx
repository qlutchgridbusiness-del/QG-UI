"use client";

import { useEffect, useState } from "react";
import { Button, TimePicker, InputNumber, Switch, message, DatePicker } from "antd";
import dayjs from "dayjs";
import axios from "axios";
import dynamic from "next/dynamic";

const GoogleMap = dynamic(() => import("./MapRadius"), { ssr: false });

export default function BusinessSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);

  // Basic
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [acceptingOrders, setAcceptingOrders] = useState(true);

  // Shifts
  const [morningStart, setMorningStart] = useState(dayjs("09:00", "HH:mm"));
  const [morningEnd, setMorningEnd] = useState(dayjs("12:00", "HH:mm"));
  const [eveningStart, setEveningStart] = useState(dayjs("15:00", "HH:mm"));
  const [eveningEnd, setEveningEnd] = useState(dayjs("19:00", "HH:mm"));

  // Breaks (multiple allowed)
  const [breaks, setBreaks] = useState<{ start: any; end: any }[]>([]);

  // Holidays
  const [holidays, setHolidays] = useState<any[]>([]);

  // Max bookings per day
  const [maxBookings, setMaxBookings] = useState<number>(10);

  // Radius (km)
  const [radius, setRadius] = useState<number>(5);

  // Map center
  const [center, setCenter] = useState({ lat: 12.9716, lng: 77.5946 });

  const daysList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const businessRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/business/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const biz = businessRes.data?.businesses?.find(
        (b: any) => b.b_ownerId === user.id
      );

      if (!biz) return;

      setBusiness(biz);

      // Load settings from backend OR defaults
      setSelectedDays(biz.workingDays || ["Mon", "Tue", "Wed", "Thu", "Fri"]);
      setAcceptingOrders(biz.acceptingOrders ?? true);

      setMorningStart(dayjs(biz.morningStart || "09:00", "HH:mm"));
      setMorningEnd(dayjs(biz.morningEnd || "12:00", "HH:mm"));
      setEveningStart(dayjs(biz.eveningStart || "15:00", "HH:mm"));
      setEveningEnd(dayjs(biz.eveningEnd || "19:00", "HH:mm"));

      setBreaks(biz.breaks || []);
      setHolidays(biz.holidays || []);

      setMaxBookings(biz.maxBookingsPerDay || 10);
      setRadius(biz.radius || 5);
      setCenter(biz.location || { lat: 12.9716, lng: 77.5946 });
    } catch (err) {
      console.error(err);
      message.error("Couldn't load settings");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const addBreak = () => {
    setBreaks([...breaks, { start: dayjs("13:00", "HH:mm"), end: dayjs("14:00", "HH:mm") }]);
  };

  const updateBreak = (index: number, field: "start" | "end", value: any) => {
    const newBreaks = [...breaks];
    newBreaks[index][field] = value;
    setBreaks(newBreaks);
  };

  const removeBreak = (index: number) => {
    setBreaks(breaks.filter((_, i) => i !== index));
  };

  const addHoliday = (date: any) => {
    if (!date) return;
    const formatted = date.format("YYYY-MM-DD");
    if (!holidays.includes(formatted)) {
      setHolidays([...holidays, formatted]);
    }
  };

  const removeHoliday = (date: string) => {
    setHolidays(holidays.filter((h) => h !== date));
  };

  const saveSettings = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `NEXT_PUBLIC_API_URL/business/${business.b_id}/settings`,
        {
          acceptingOrders,
          workingDays: selectedDays,

          // Shifts
          morningStart: morningStart.format("HH:mm"),
          morningEnd: morningEnd.format("HH:mm"),
          eveningStart: eveningStart.format("HH:mm"),
          eveningEnd: eveningEnd.format("HH:mm"),

          breaks: breaks.map((b) => ({
            start: b.start.format("HH:mm"),
            end: b.end.format("HH:mm"),
          })),

          holidays,
          maxBookingsPerDay: maxBookings,

          radius,
          location: center,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      message.error("Failed to save settings");
    }
  };

  if (loading) return <p>Loading settings...</p>;

  return (
    <div className="space-y-10 pb-20">
      <h2 className="text-2xl font-semibold">Business Settings</h2>

      {/* Accepting Orders */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Accepting Orders Today</h3>
          <Switch
            checked={acceptingOrders}
            onChange={setAcceptingOrders}
            className="bg-blue-600"
          />
        </div>
      </div>

      {/* Working Days */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h3 className="text-lg font-semibold mb-3">Working Days</h3>
        <div className="flex flex-wrap gap-3">
          {daysList.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`px-4 py-2 rounded-full transition border ${
                selectedDays.includes(day)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Shifts */}
      <div className="bg-white p-6 rounded-xl shadow border space-y-6">
        <h3 className="text-lg font-semibold">Working Hours (Shifts)</h3>

        {/* Morning */}
        <div>
          <p className="font-medium mb-1">Morning Shift</p>
          <div className="flex gap-4">
            <TimePicker value={morningStart} onChange={setMorningStart} format="HH:mm" />
            <TimePicker value={morningEnd} onChange={setMorningEnd} format="HH:mm" />
          </div>
        </div>

        {/* Evening */}
        <div>
          <p className="font-medium mb-1">Evening Shift</p>
          <div className="flex gap-4">
            <TimePicker value={eveningStart} onChange={setEveningStart} format="HH:mm" />
            <TimePicker value={eveningEnd} onChange={setEveningEnd} format="HH:mm" />
          </div>
        </div>
      </div>

      {/* Break Hours */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Break Hours</h3>
          <Button onClick={addBreak}>+ Add Break</Button>
        </div>

        <div className="space-y-4">
          {breaks.map((b, i) => (
            <div key={i} className="flex gap-4 items-center">
              <TimePicker value={b.start} onChange={(v) => updateBreak(i, "start", v)} />
              <TimePicker value={b.end} onChange={(v) => updateBreak(i, "end", v)} />
              <Button danger onClick={() => removeBreak(i)}>Remove</Button>
            </div>
          ))}
        </div>
      </div>

      {/* Holidays */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h3 className="text-lg font-semibold mb-3">Holiday Calendar</h3>

        <DatePicker onChange={addHoliday} className="mb-4" />

        <div className="flex flex-wrap gap-2">
          {holidays.map((date) => (
            <div
              key={date}
              className="px-4 py-2 bg-gray-100 rounded-full border flex items-center gap-2"
            >
              {date}
              <button className="text-red-500" onClick={() => removeHoliday(date)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Max Bookings */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h3 className="text-lg font-semibold mb-3">Maximum Bookings Per Day</h3>
        <InputNumber
          min={1}
          max={100}
          value={maxBookings}
          onChange={(v) => setMaxBookings(Number(v))}
        />
      </div>

      {/* Map Radius */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h3 className="text-lg font-semibold mb-3">Service Area (Map Radius)</h3>

        <GoogleMap
          radius={radius}
          onRadiusChange={setRadius}
          center={center}
          onCenterChange={setCenter}
        />
      </div>

      <Button type="primary" onClick={saveSettings} className="bg-blue-600 px-6 py-3 text-lg">
        Save All Settings
      </Button>
    </div>
  );
}
