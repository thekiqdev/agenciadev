import { Trash2, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface GalleryUploadListProps {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket: string;
  folder?: string;
}

export function GalleryUploadList({ value, onChange, bucket, folder }: GalleryUploadListProps) {
  const setAt = (index: number, url: string) => {
    const next = [...value];
    next[index] = url;
    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const addSlot = () => {
    onChange([...value, ""]);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <Images className="w-4 h-4" />
        Imagens extras (além da capa). Envie uma por linha.
      </p>
      {value.map((url, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-1 min-w-0">
            <ImageUpload value={url} onChange={(u) => setAt(index, u)} bucket={bucket} folder={folder} />
          </div>
          <Button type="button" variant="outline" size="icon" className="shrink-0 mt-0" onClick={() => removeAt(index)} aria-label="Remover imagem da galeria">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addSlot}>
        + Adicionar imagem à galeria
      </Button>
    </div>
  );
}
