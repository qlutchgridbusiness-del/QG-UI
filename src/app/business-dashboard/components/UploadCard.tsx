export function UploadCard({
  label,
  preview,
  onUpload,
}: {
  label: string;
  preview?: string;
  onUpload: (file: File) => void;
}) {
  return (
    <div className="border rounded-xl p-4 flex flex-col items-center justify-center text-center bg-gray-50">
      <p className="text-sm font-medium mb-2">{label}</p>

      {preview ? (
        <>
          <img
            src={preview}
            className="w-24 h-24 object-cover rounded mb-2"
          />
          <span className="text-xs text-green-600 font-medium">
            Uploaded ✓
          </span>
          <label className="mt-2 text-indigo-600 text-xs cursor-pointer">
            Replace
            <input
              type="file"
              className="hidden"
              accept="image/*,application/pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
              }}
            />
          </label>
        </>
      ) : (
        <label className="cursor-pointer flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            📄
          </div>
          <span className="text-xs text-gray-600">
            Tap to upload
          </span>
          <input
            type="file"
            className="hidden"
            accept="image/*,application/pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
            }}
          />
        </label>
      )}
    </div>
  );
}
