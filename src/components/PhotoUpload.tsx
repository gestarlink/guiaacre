import { useRef, useState } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  /** Folder/prefix inside the bucket (e.g. user.id) */
  folder: string;
  bucket?: string;
  className?: string;
};

/**
 * Upload a photo from device or capture with camera.
 * Uploads to Supabase Storage immediately and returns the public URL.
 */
export function PhotoUpload({ value, onChange, folder, bucket = "business-photos", className }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${folder}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Foto enviada!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
    e.target.value = "";
  };

  return (
    <div className={className}>
      {value ? (
        <div className="relative">
          <img src={value} alt="Foto" className="w-full h-44 object-cover rounded-xl border border-border" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-card/95 border border-border inline-flex items-center justify-center shadow"
            aria-label="Remover foto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            disabled={uploading}
            className="h-24 rounded-xl border-2 border-dashed border-border bg-card flex flex-col items-center justify-center gap-1 text-sm text-muted-foreground hover:bg-muted/50 transition disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            Tirar foto
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="h-24 rounded-xl border-2 border-dashed border-border bg-card flex flex-col items-center justify-center gap-1 text-sm text-muted-foreground hover:bg-muted/50 transition disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            Galeria
          </button>
        </div>
      )}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={onPick} />
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
    </div>
  );
}
