import { X } from "lucide-react";

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImageModal = ({ imageUrl, onClose }: ImageModalProps) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute top-6 right-6 p-2 text-white hover:cursor-pointer hover:bg-white/10 rounded-full transition-colors"
        onClick={onClose}
      >
        <X size={32} />
      </button>
      <img
        src={imageUrl}
        alt="Preview"
        className="max-w-7xl max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default ImageModal;
