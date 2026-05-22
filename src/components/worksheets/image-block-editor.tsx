'use client';

import { useCallback, useRef, useState } from 'react';
import { ImageIcon, Link2, Loader2, Search, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api/client';
import { WORKSHEET_IMAGE_MAX_BYTES } from '@/lib/worksheets/image-upload';
import type { WorksheetStructureBlock } from '@/types/worksheet';

type ImageBlock = Extract<
  WorksheetStructureBlock,
  { block_type: 'image' }
>;

type StockPhoto = {
  id: number;
  src: string;
  thumbnail: string;
  alt: string;
  photographer: string;
};

type ImageSourceTab = 'upload' | 'stock' | 'link';

export function ImageBlockEditor({
  block,
  baseId,
  onChange,
}: {
  block: ImageBlock;
  baseId: string;
  onChange: (next: ImageBlock) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<ImageSourceTab>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [stockQuery, setStockQuery] = useState('classroom education');
  const [stockPhotos, setStockPhotos] = useState<StockPhoto[]>([]);
  const [isSearchingStock, setIsSearchingStock] = useState(false);
  const [stockAvailable, setStockAvailable] = useState(true);

  const uploadFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/worksheets/images/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          throw new Error(
            await getApiErrorMessage(res, 'Failed to upload image.'),
          );
        }
        const payload = (await res.json()) as { url?: string };
        if (!payload.url) throw new Error('Upload response is missing a URL.');
        onChange({
          ...block,
          src: payload.url,
          alt: block.alt.trim() || file.name.replace(/\.[^.]+$/, ''),
        });
        toast.success('Image uploaded');
      } catch (error) {
        toast.error('Upload failed', {
          description:
            error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setIsUploading(false);
      }
    },
    [block, onChange],
  );

  const onFileSelected = (file: File | undefined) => {
    if (!file) return;
    void uploadFile(file);
  };

  const searchStock = async () => {
    setIsSearchingStock(true);
    try {
      const params = new URLSearchParams({
        q: stockQuery.trim() || 'education',
      });
      const res = await fetch(`/api/worksheets/images/stock?${params}`);
      if (res.status === 503) {
        setStockAvailable(false);
        setStockPhotos([]);
        return;
      }
      if (!res.ok) {
        throw new Error(
          await getApiErrorMessage(res, 'Could not search stock photos.'),
        );
      }
      const payload = (await res.json()) as { photos?: StockPhoto[] };
      setStockPhotos(payload.photos ?? []);
      setStockAvailable(true);
    } catch (error) {
      toast.error('Stock search failed', {
        description:
          error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSearchingStock(false);
    }
  };

  const selectStockPhoto = (photo: StockPhoto) => {
    onChange({
      ...block,
      src: photo.src,
      alt: block.alt.trim() || photo.alt,
    });
    toast.success('Stock photo added');
  };

  const tabButtonClass = (active: boolean) =>
    cn(
      'h-7 flex-1 gap-1 px-2 text-[10px] font-medium',
      active ? 'bg-background shadow-sm' : 'text-muted-foreground',
    );

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-md border border-border bg-muted/50 p-1">
        <Button
          type="button"
          variant={tab === 'upload' ? 'secondary' : 'ghost'}
          size="sm"
          className={tabButtonClass(tab === 'upload')}
          onClick={() => setTab('upload')}
        >
          <Upload className="h-3 w-3 shrink-0" />
          Upload
        </Button>
        <Button
          type="button"
          variant={tab === 'stock' ? 'secondary' : 'ghost'}
          size="sm"
          className={tabButtonClass(tab === 'stock')}
          onClick={() => {
            setTab('stock');
            if (stockPhotos.length === 0 && stockAvailable) {
              void searchStock();
            }
          }}
        >
          <ImageIcon className="h-3 w-3 shrink-0" />
          Stock
        </Button>
        <Button
          type="button"
          variant={tab === 'link' ? 'secondary' : 'ghost'}
          size="sm"
          className={tabButtonClass(tab === 'link')}
          onClick={() => setTab('link')}
        >
          <Link2 className="h-3 w-3 shrink-0" />
          Link
        </Button>
      </div>

      {block.src.trim() ? (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt || 'Preview'}
            className="max-h-40 w-full object-contain"
          />
        </div>
      ) : null}

      {tab === 'upload' ? (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              onFileSelected(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('border-primary/50', 'bg-primary/5');
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove(
                'border-primary/50',
                'bg-primary/5',
              );
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove(
                'border-primary/50',
                'bg-primary/5',
              );
              const file = e.dataTransfer.files?.[0];
              onFileSelected(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/80 px-4 py-6 text-center transition-colors hover:border-slate-400 hover:bg-slate-100/80',
              isUploading && 'pointer-events-none opacity-60',
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                <span className="text-xs text-slate-600">Uploading…</span>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-slate-500" />
                <span className="text-xs font-medium text-slate-700">
                  Click or drag an image here
                </span>
                <span className="text-[10px] text-slate-500">
                  JPEG, PNG, WebP, or GIF · max{' '}
                  {Math.round(WORKSHEET_IMAGE_MAX_BYTES / (1024 * 1024))} MB
                </span>
              </>
            )}
          </div>
        </div>
      ) : null}

      {tab === 'stock' ? (
        <div className="space-y-2">
          {!stockAvailable ? (
            <p className="text-xs text-muted-foreground">
              Stock photos are not available on this server. Use upload or paste
              a link instead.
            </p>
          ) : (
            <>
              <div className="flex gap-2">
                <Input
                  value={stockQuery}
                  onChange={(e) => setStockQuery(e.target.value)}
                  placeholder="Search (e.g. science, classroom)"
                  className="h-8 border-slate-200 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void searchStock();
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 px-2"
                  disabled={isSearchingStock}
                  onClick={() => void searchStock()}
                >
                  {isSearchingStock ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Search className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Free photos from Pexels. Click a thumbnail to use it on your
                worksheet.
              </p>
              {stockPhotos.length > 0 ? (
                <div className="grid max-h-48 grid-cols-3 gap-1.5 overflow-y-auto">
                  {stockPhotos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      className="overflow-hidden rounded border border-slate-200 bg-white transition hover:border-primary hover:ring-1 hover:ring-primary/30"
                      title={photo.alt}
                      onClick={() => selectStockPhoto(photo)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.thumbnail}
                        alt={photo.alt}
                        className="aspect-video w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  {isSearchingStock
                    ? 'Searching…'
                    : 'Search to browse stock images.'}
                </p>
              )}
            </>
          )}
        </div>
      ) : null}

      {tab === 'link' ? (
        <div>
          <label
            htmlFor={`${baseId}_src`}
            className="mb-1 block text-[11px] text-slate-500"
          >
            Image URL
          </label>
          <Input
            id={`${baseId}_src`}
            value={block.src}
            onChange={(e) => onChange({ ...block, src: e.target.value })}
            placeholder="https://…"
            className="border-slate-200"
          />
          <p className="mt-1 text-[10px] text-muted-foreground">
            Use a direct image link. Google Drive share links often fail in
            PDF export.
          </p>
        </div>
      ) : null}

      <div>
        <label htmlFor={`${baseId}_alt`} className="mb-1 block text-[11px] text-slate-500">
          Alt text (for accessibility)
        </label>
        <Input
          id={`${baseId}_alt`}
          value={block.alt}
          onChange={(e) => onChange({ ...block, alt: e.target.value })}
          placeholder="Describe the image for students"
          className="border-slate-200"
        />
      </div>
    </div>
  );
}
