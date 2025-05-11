
import { Room } from '@/lib/types';

export interface CreateRoomRequest {
  name: string;
  videoId?: string | null;
  scheduledTime?: string | null;
  isPrivate?: boolean;
}

export interface RoomControllerInterface {
  /**
   * Get all available rooms from the backend
   */
  getAllRooms: () => Promise<Room[]>;
  
  /**
   * Get details of a specific room by ID
   */
  getRoomById: (roomId: string) => Promise<Room>;
  
  /**
   * Create a new room
   */
  createRoom: (request: CreateRoomRequest) => Promise<Room>;
  
  /**
   * Join a room as a user
   */
  joinRoom: (roomId: string) => Promise<void>;
  
  /**
   * Leave a room
   */
  leaveRoom: (roomId: string) => Promise<void>;
}

class RoomController implements RoomControllerInterface {
  private readonly API_BASE_URL = 'http://localhost:8080/api';
  
  /**
   * Perform a fetch request to the API with appropriate headers
   */
  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get all available rooms
   */
  public async getAllRooms(): Promise<Room[]> {
    return this.fetchApi<Room[]>('/rooms');
  }

  /**
   * Get details of a specific room by ID
   */
  public async getRoomById(roomId: string): Promise<Room> {
    return this.fetchApi<Room>(`/rooms/${roomId}`);
  }

  /**
   * Create a new room
   */
  public async createRoom(request: CreateRoomRequest): Promise<Room> {
    return this.fetchApi<Room>('/rooms', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Join a room as a user
   */
  public async joinRoom(roomId: string): Promise<void> {
    await this.fetchApi(`/rooms/${roomId}/join`, {
      method: 'POST',
    });
  }

  /**
   * Leave a room
   */
  public async leaveRoom(roomId: string): Promise<void> {
    await this.fetchApi(`/rooms/${roomId}/leave`, {
      method: 'POST',
    });
  }
}

// Export a singleton instance
export const roomController = new RoomController();
