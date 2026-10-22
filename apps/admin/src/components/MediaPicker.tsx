import { useState, useEffect, useRef } from "react";
import { apiGet } from "../lib/api";

interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  filename: string;
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
}

export function MediaPicker({ open, onClose, onSelect }: MediaPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    apiGet<{ data: MediaItem[] }>("/media")
      .then((res) => setItems(res.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("file", f));
    
    // Fallback pakai fetch karena apiUpload mungkin tidak ada
    const token = sessionStorage.getItem("reactpress.accessToken");
    await fetch((import.meta.env.VITE_API_URL || "/api") + "/media/upload", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    
    // reload
    apiGet<{ data: MediaItem[] }>("/media").then((res) => setItems(res.data ?? []));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg border border-[var(--line)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--line)] p-4">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Pilih Media</h2>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--ink)]">&times;</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-sm text-[var(--muted)]">Memuat...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Belum ada media.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {items.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onSelect(m)}
                  className="aspect-square overflow-hidden rounded border border-[var(--line)] hover:border-[var(--accent)]"
                >
                  <img src={m.thumbnailUrl || m.url} alt={m.filename} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[var(--line)] p-4 flex justify-between">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm text-white hover:bg-black"
          >
            Upload Baru
          </button>
          <button onClick={onClose} className="rounded-md border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)] hover:bg-[#f4f4f2]">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
