// src/app/business-dashboard/bookings/components/ImageUploadModal.tsx
"use client";

import { Modal, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (files: File[]) => Promise<void>;
};

export default function ImageUploadModal({
  open,
  title,
  onClose,
  onSubmit,
}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!files.length) return alert("Please upload at least one image");

    setLoading(true);
    await onSubmit(files);
    setLoading(false);
    setFiles([]);
    onClose();
  }

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onClose}
      footer={null}
      destroyOnClose
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

      <Button
        loading={loading}
        type="primary"
        className="mt-4 w-full"
        onClick={handleSubmit}
      >
        Submit
      </Button>
    </Modal>
  );
}
