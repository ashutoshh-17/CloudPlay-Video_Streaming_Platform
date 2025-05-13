
import { Room, User, Video } from '@/lib/types';
import { toast } from "@/components/ui/use-toast";

// Base API URL - replace with your SpringBoot API URL
// We're using relative URLs to avoid CORS issues
const API_BASE_URL = '/api';

// Helper function for API calls
async function fetchData<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // important!
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
}

// Get list of available videos
export async function getVideos(): Promise<Video[]> {
  try {
    return await fetchData<Video[]>('/videos');
  } catch (error) {
    console.error('Error fetching videos:', error);
    // Return empty array instead of throwing to prevent breaking the UI
    return [];
  }
}

// Get video details by ID
export async function getVideoById(id: string): Promise<Video> {
  try {
    return await fetchData<Video>(`/videos/${id}`);
  } catch (error) {
    console.error(`Error fetching video ${id}:`, error);
    toast({
      title: "Error Loading Video",
      description: "Could not load the requested video",
      variant: "destructive",
    });
    throw error;
  }
}

// Upload a video
export async function uploadVideo(file: File, title: string, description: string): Promise<Video> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    
    const response = await fetch(`${API_BASE_URL}/videos/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Video upload failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Upload failed:', error);
    toast({
      title: "Upload Failed",
      description: "Could not upload your video. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
}

// Get available rooms
export async function getRooms(): Promise<Room[]> {
  try {
    return await fetchData<Room[]>('/rooms');
  } catch (error) {
    console.error('Error fetching rooms:', error);
    // Return empty array instead of throwing to prevent breaking the UI
    return [];
  }
}

// Get room details by ID
export async function getRoomById(id: string): Promise<Room> {
  try {
    return await fetchData<Room>(`/rooms/${id}`);
  } catch (error) {
    console.error(`Error fetching room ${id}:`, error);
    toast({
      title: "Error Loading Room",
      description: "Could not load the requested room",
      variant: "destructive",
    });
    throw error;
  }
}

// Create a new room
export async function createRoom(
  name: string, 
  videoId: string | null, 
  scheduledTime?: Date
): Promise<Room> {
  try {
    return await fetchData<Room>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ 
        name, 
        videoId,
        scheduledTime: scheduledTime ? scheduledTime.toISOString() : null,
        isPrivate: false // Default to public rooms
      }),
    });
  } catch (error) {
    console.error('Error creating room:', error);
    toast({
      title: "Room Creation Failed",
      description: "Could not create a new room. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
}

// Join room
export async function joinRoom(roomId: string, userId: string): Promise<void> {
  try {
    await fetchData(`/rooms/${roomId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  } catch (error) {
    console.error(`Error joining room ${roomId}:`, error);
    toast({
      title: "Error Joining Room",
      description: "Could not join the room",
      variant: "destructive",
    });
    throw error;
  }
}

// Leave room
export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  try {
    await fetchData(`/rooms/${roomId}/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  } catch (error) {
    console.error(`Error leaving room ${roomId}:`, error);
    // We don't throw here since this might be called during cleanup
  }
}

// Get current user (if authenticated)
export async function getCurrentUser(): Promise<User | null> {
  try {
    return await fetchData<User>('/users/me');
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
