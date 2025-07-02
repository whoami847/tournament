'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadImage } from '@/lib/storage-service';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  initialImageUrl?: string;
  onUploadComplete: (url: string) => void;
  storagePath: string;
}

export function ImageUpload({ initialImageUrl = '', onUploadComplete, storagePath }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const downloadURL = await uploadImage(file, storagePath, setProgress);
      setImageUrl(downloadURL);
      onUploadComplete(downloadURL);
      toast({
        title: 'Upload Successful',
        description: 'Your image has been uploaded and saved.',
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt="Uploaded preview" fill className="object-cover" />
        ) : (
          <div className="text-center text-muted-foreground">
            <Camera className="mx-auto h-12 w-12 mb-2" />
            <p>No image uploaded</p>
          </div>
        )}
        <div 
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={triggerFileSelect}
        >
          <div className="text-center text-white">
            <Camera className="mx-auto h-8 w-8 mb-2" />
            <p className="font-semibold">Change Image</p>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        disabled={uploading}
      />

      {uploading && (
        <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">{`Uploading... ${Math.round(progress)}%`}</p>
        </div>
      )}
      
      {!uploading && !imageUrl &&
        <Button type="button" onClick={triggerFileSelect} disabled={uploading} className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            Upload Image
        </Button>
      }

      {error && <p className="text-sm text-destructive flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</p>}
    </div>
  );
}
