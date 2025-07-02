'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Camera, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  initialImageUrl?: string;
  onUploadComplete: (url: string) => void;
}

export function ImageUpload({ initialImageUrl = '', onUploadComplete }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Safety check for file size to avoid exceeding Firestore document limits
    if (file.size > 500 * 1024) { // 500KB limit
      const errorMsg = "Image is too large. Please upload an image smaller than 500KB.";
      setError(errorMsg);
      toast({
        title: 'Upload Failed',
        description: errorMsg,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        setProgress(progress);
      }
    };

    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImageUrl(base64String);
      onUploadComplete(base64String);
      setUploading(false);
      setProgress(100);
      toast({
        title: 'Image Processed',
        description: 'The image is ready to be saved with the form.',
      });
    };

    reader.onerror = () => {
      const errorMessage = 'Failed to read the file.';
      setError(errorMessage);
      setUploading(false);
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    };

    reader.readAsDataURL(file);
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
            <p className="text-sm text-center text-muted-foreground">{`Processing... ${Math.round(progress)}%`}</p>
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
