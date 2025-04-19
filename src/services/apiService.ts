
import { Room, User, Video } from '@/lib/types';

// Base API URL - replace with your SpringBoot API URL
const API_BASE_URL = '/api';

// Helper function for API calls
async function fetchData<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return await response.json();
}

// Get list of available videos
export async function getVideos(): Promise<Video[]> {
  return fetchData<Video[]>('/videos');
}

// Get video details by ID
export async function getVideoById(id: string): Promise<Video> {
  return fetchData<Video>(`/videos/${id}`);
}

// Get available rooms
export async function getRooms(): Promise<Room[]> {
  return fetchData<Room[]>('/rooms');
}

// Get room details by ID
export async function getRoomById(id: string): Promise<Room> {
  return fetchData<Room>(`/rooms/${id}`);
}

// Create a new room
export async function createRoom(name: string, videoId: string | null): Promise<Room> {
  return fetchData<Room>('/rooms', {
    method: 'POST',
    body: JSON.stringify({ name, videoId }),
  });
}

// Join room
export async function joinRoom(roomId: string, userId: string): Promise<void> {
  await fetchData(`/rooms/${roomId}/join`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

// Leave room
export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  await fetchData(`/rooms/${roomId}/leave`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

// Get current user (if authenticated)
export async function getCurrentUser(): Promise<User | null> {
  try {
    return await fetchData<User>('/users/me');
  } catch (error) {
    return null;
  }
}
