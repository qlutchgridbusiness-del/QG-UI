"use client";

export default function UploadImageModal({ open, onClose, setImages }: any) {
  if (!open) return null;

  const handleUpload = () => {
    setImages((prev: string[]) => [...prev, "/new-image.jpg"]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-80">
        <h2 className="text-xl mb-4">Upload Image</h2>
        <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Upload Mock Image
        </button>
      </div>
    </div>
  );
}
