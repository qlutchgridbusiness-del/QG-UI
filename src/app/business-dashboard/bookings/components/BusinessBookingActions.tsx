"use client";

import { useState } from "react";
import ImageUploadModal from "./ImmageUploadModal";
import { startService, completeService } from "../../../lib/api";
import { playNotificationSound } from "@/utils/sound";
import { message } from "antd";

export function BookingActionButtons({ booking }: { booking: any }) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  async function handleStart(files: string[]) {
    await startService(booking.id, files);
    playNotificationSound();
    message.success("Service started");
    setStartOpen(false);
  }

  async function handleComplete(files: File[]) {
    const amount = prompt("Enter final service amount");
    if (!amount) return;

    await completeService(booking.id, files, Number(amount));
    playNotificationSound();
    message.success("Service completed");
    setEndOpen(false);
  }

  return (
    <>
      {booking.status === "BUSINESS_ACCEPTED" && (
        <button onClick={() => setStartOpen(true)} className="btn-primary">
          Start Service
        </button>
      )}

      {booking.status === "SERVICE_STARTED" && (
        <button onClick={() => setEndOpen(true)} className="btn-success">
          Complete Service
        </button>
      )}

      <ImageUploadModal
        open={startOpen}
        title="Upload Before Service Images"
        onClose={() => setStartOpen(false)}
        onSubmit={handleStart}
      />

      <ImageUploadModal
        open={endOpen}
        title="Upload After Service Images"
        onClose={() => setEndOpen(false)}
        onSubmit={handleComplete}
      />
    </>
  );
}
