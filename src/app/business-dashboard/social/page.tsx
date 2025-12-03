"use client";

import ImageGallery from "../components/ImageGallery";
import UploadImageModal from "../components/UploadImageModal";
import { Button } from "antd";
import { useState } from "react";
import Image from "next/image";

export default function SocialPage() {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>([
    "/demo1.jpg",
    "/demo2.jpg",
    "/demo3.jpg",
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Social Branding</h2>
        <Button
          type="primary"
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Upload Image
        </Button>
      </div>

      {/* Banner */}
      <div className="relative h-56 w-full rounded-xl overflow-hidden shadow-md bg-gray-200">
        <Image
          src="/social-banner.jpg"
          alt="Social Banner"
          fill
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <h3 className="text-white text-2xl font-semibold drop-shadow">
            Build Your Social Presence
          </h3>
        </div>
      </div>

      {/* Gallery Section */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Your Gallery</h3>
        <ImageGallery images={images} />
      </div>

      {/* Upload Modal */}
      <UploadImageModal
        open={open}
        onClose={() => setOpen(false)}
        setImages={setImages}
      />
    </div>
  );
}
