import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadVideo } from '@/services/apiService';
import { Video, FileVideo, Upload } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface VideoUploadProps {
  onUploadSuccess: (videoData: any) => void;
  onUploadStart: () => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUploadSuccess, onUploadStart }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Hidden video ref for grabbing duration ---
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('video/')) {
      setError('Please select a video file');
      setFile(null);
      setDuration(null);
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Auto-populate title from filename if empty
    if (!title) {
      const fileName = selectedFile.name.split('.').slice(0, -1).join('.');
      setTitle(fileName);
    }

    // Extract duration
    const objectUrl = URL.createObjectURL(selectedFile);

    // Set to null while loading
    setDuration(null);

    // Use a hidden video element to load metadata
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      // Round to the nearest integer for seconds
      setDuration(Math.round(video.duration));
      URL.revokeObjectURL(objectUrl);
    };

    video.onerror = () => {
      setError('Could not load video metadata');
      setDuration(null);
      URL.revokeObjectURL(objectUrl);
    };

    video.src = objectUrl;
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a video file');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (duration === null || isNaN(duration)) {
      setError('Could not determine video duration');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      onUploadStart();

      // Simulate progress bar
      const simulateProgress = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(simulateProgress);
            return prev;
          }
          return prev + 5;
        });
      }, 300);

      // --- Add duration to upload ---
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('duration', duration.toString());

      // Use fetch directly (bypassing the uploadVideo abstraction for now)
      // If you want to keep using uploadVideo from apiService, you may update that too!
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(simulateProgress);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Video upload failed: ${response.statusText}`);
      }

      const uploadedVideo = await response.json();

      setFile(null);
      setTitle('');
      setDescription('');
      setDuration(null);

      toast({
        title: "Video Uploaded Successfully",
        description: "Your video has been uploaded and is now available."
      });

      onUploadSuccess(uploadedVideo);

    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please make sure the server is running.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-background">
      {/* Hidden video for debugging, not used in UI */}
      {/* <video ref={hiddenVideoRef} style={{ display: 'none' }} /> */}

      <div className="flex items-center gap-2">
        <FileVideo className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">Upload New Video</h3>
      </div>

      <div className="space-y-3">
        <div>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />

          <div
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-md p-6 cursor-pointer transition-colors flex flex-col items-center justify-center ${
              file ? 'border-primary/30 bg-primary/5' : 'border-muted hover:border-primary/30 hover:bg-muted/30'
            }`}
          >
            {file ? (
              <div className="text-center">
                <Video className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-sm break-all max-w-full">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                {duration !== null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Duration: {duration} sec
                  </p>
                )}
                {duration === null && (
                  <p className="text-xs text-muted-foreground mt-1 text-warning">
                    Extracting duration...
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to select a video file</p>
                <p className="text-xs text-muted-foreground mt-1">MP4, WebM, MOV up to 100MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Video description"
          />
        </div>

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        {isUploading && (
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || isUploading || duration === null}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </Button>
      </div>
    </div>
  );
};

export default VideoUpload;
