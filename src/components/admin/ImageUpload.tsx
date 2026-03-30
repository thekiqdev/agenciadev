import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ApiError } from "@/integrations/api/client";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket: string;
  folder?: string;
}

export function ImageUpload({ value, onChange, bucket, folder = "" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens são permitidas");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("bucket", bucket);
      form.append("folder", folder);

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        credentials: "include",
        body: form,
      });

      const ct = response.headers.get("content-type") ?? "";
      const isJson = ct.includes("application/json");
      let payload: { error?: string; url?: string } | null = null;
      if (isJson) {
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }
      }

      if (!response.ok) {
        if (response.status === 413) {
          toast.error(
            "Arquivo grande demais para o proxy (413). Use imagem menor ou redeploy do front após atualizar o Nginx (client_max_body_size).",
          );
          return;
        }
        const msg =
          typeof payload?.error === "string"
            ? payload.error
            : !isJson
              ? `Erro ${response.status} do servidor`
              : "upload_failed";
        throw new ApiError(msg, response.status, payload);
      }

      if (!payload?.url) {
        toast.error("Resposta inválida do servidor");
        return;
      }

      onChange(payload.url);
      toast.success("Imagem enviada com sucesso");
    } catch (error) {
      console.error("Upload error:", error);
      const msg = error instanceof ApiError ? error.message : "Erro ao enviar imagem";
      toast.error(msg);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="w-32 h-32 rounded-lg object-cover border border-border"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center hover:opacity-80"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="h-32 w-full border-dashed border-2 flex flex-col gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">Enviando...</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6" />
              <span className="text-sm">Clique para enviar imagem</span>
              <span className="text-xs text-muted-foreground">PNG, JPG até 5MB</span>
            </>
          )}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
