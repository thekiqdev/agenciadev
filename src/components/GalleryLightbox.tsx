import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

/** URLs únicas: capa primeiro, depois galeria (sem repetir). */
export function orderedGalleryUrls(
  imageUrl: string | null | undefined,
  galleryUrls: string[] | null | undefined,
): string[] {
  const list: string[] = [];
  const seen = new Set<string>();
  const push = (u: string | null | undefined) => {
    if (u && !seen.has(u)) {
      seen.add(u);
      list.push(u);
    }
  };
  push(imageUrl);
  for (const u of galleryUrls ?? []) push(u);
  return list;
}

type GalleryLightboxProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  initialIndex?: number;
  title?: string;
};

export function GalleryLightbox({
  open,
  onOpenChange,
  images,
  initialIndex = 0,
  title = "Galeria",
}: GalleryLightboxProps) {
  const valid = images.filter(Boolean);
  const start = Math.min(Math.max(0, initialIndex), Math.max(0, valid.length - 1));

  if (valid.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[min(100vw-1rem,56rem)] p-0 gap-0 overflow-hidden border-border bg-card sm:rounded-xl">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">Use as setas para navegar entre as imagens.</DialogDescription>
        <Carousel
          key={`${open}-${start}-${valid.join("|")}`}
          className="w-full relative py-10 px-2 sm:px-12"
          opts={{ startIndex: start, loop: valid.length > 1 }}
        >
          <CarouselContent>
            {valid.map((url, i) => (
              <CarouselItem key={`${url}-${i}`}>
                <div className="flex min-h-[40vh] max-h-[75vh] items-center justify-center p-2">
                  <img
                    src={url}
                    alt=""
                    className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
                    loading="lazy"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {valid.length > 1 && (
            <>
              <CarouselPrevious
                type="button"
                className="left-1 sm:left-2 border-border bg-background/90 text-foreground hover:bg-background"
              />
              <CarouselNext
                type="button"
                className="right-1 sm:right-2 border-border bg-background/90 text-foreground hover:bg-background"
              />
            </>
          )}
        </Carousel>
      </DialogContent>
    </Dialog>
  );
}
