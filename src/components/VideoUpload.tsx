
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadVideo } from '@/services/apiService';
import { Video, FileVideo, Upload } from 'lucide-react';

interface VideoUploadProps {
  onUploadSuccess: (videoData: any) => void;
  onUploadStart: () => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUploadSuccess, onUploadStart }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (!selectedFile.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    
    // Auto-populate title from filename if empty
    if (!title) {
      const fileName = selectedFile.name.split('.').slice(0, -1).join('.');
      setTitle(fileName);
    }
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

    try {
      setIsUploading(true);
      setError(null);
      onUploadStart();
      
      // In a real application, you would track upload progress
      // For demo, we'll use a simulated progress
      const simulateProgress = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(simulateProgress);
            return prev;
          }
          return prev + 5;
        });
      }, 300);
      
      const uploadedVideo = await uploadVideo(file, title, description);
      
      clearInterval(simulateProgress);
      setUploadProgress(100);
      
      setFile(null);
      setTitle('');
      setDescription('');
      
      onUploadSuccess(uploadedVideo);
      
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. This is a demo frontend without the required SpringBoot backend.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-background">
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
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </Button>
      </div>
    </div>
  );
};

export default VideoUpload;
