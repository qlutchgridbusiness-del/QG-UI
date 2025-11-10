export default function ImageGallery({ images }: { images: string[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((img, i) => (
        <img key={i} src={img} alt="Gallery" className="rounded-lg shadow-md" />
      ))}
    </div>
  );
}
