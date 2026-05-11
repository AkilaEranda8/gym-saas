"use client";
import React, { useRef, useState } from "react";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { useUploadLogo } from "@/hooks/useSettings";
import toast from "react-hot-toast";

interface Props {
  logoUrl?: string;
  coverImageUrl?: string;
  onUploaded: (url: string, type: "logo" | "cover") => void;
}

export default function LogoUploader({ logoUrl, coverImageUrl, onUploaded }: Props) {
  const { mutate, uploading } = useUploadLogo();
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [uploadingType, setUploadingType] = useState<"logo" | "cover" | null>(null);

  const handleFile = async (file: File, isCover: boolean) => {
    const type = isCover ? "cover" : "logo";
    setUploadingType(type);
    try {
      const url = await mutate(file, isCover);
      if (url) { onUploaded(url, type); toast.success(`${isCover ? "Cover image" : "Logo"} uploaded`); }
    } catch { toast.error("Upload failed — max 2MB, images only"); }
    finally { setUploadingType(null); }
  };

  const zone = (
    label: string,
    url: string | undefined,
    inputRef: React.RefObject<HTMLInputElement>,
    isCover: boolean,
    aspect: string,
    hint: string,
  ) => (
    <div className="flex-1">
      <p className="text-xs font-medium text-[#475569] mb-2">{label}</p>
      <button onClick={() => inputRef.current?.click()}
        className={`w-full ${aspect} border-2 border-dashed border-[#1e293b] rounded-xl overflow-hidden hover:border-[#f59e0b] transition-colors relative group`}>
        {url ? (
          <img src={url} alt={label} className="w-full h-full object-contain bg-[#0f172a]" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <ImageIcon className="w-8 h-8 text-[#334155]" />
            <span className="text-xs text-[#334155]">{hint}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          {uploadingType === (isCover ? "cover" : "logo") ? (
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          ) : (
            <Upload className="w-6 h-6 text-white" />
          )}
        </div>
      </button>
      <p className="text-[10px] text-[#334155] mt-1">{isCover ? "1200×400px recommended" : "256×256px recommended"} · max 2MB</p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f, isCover); e.target.value = ""; }} />
    </div>
  );

  return (
    <div className="flex gap-6">
      {zone("Gym Logo", logoUrl, logoRef, false, "h-28", "Click to upload logo")}
      {zone("Cover Image", coverImageUrl, coverRef, true, "h-28", "Click to upload cover")}
    </div>
  );
}
