"use client";
import ImageGallery from "../components/ImageGallery";
import UploadImageModal from "../components/UploadImageModal";
import { Button } from "antd";
import { useState } from "react";

export default function SocialPage() {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>([
    "/demo1.jpg",
    "/demo2.jpg",
    "/demo3.jpg",
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Your Gallery</h2>
        <Button onClick={() => setOpen(true)}>Upload Image</Button>
      </div>
      <ImageGallery images={images} />
      <UploadImageModal open={open} onClose={() => setOpen(false)} setImages={setImages} />
    </div>
  );
}
