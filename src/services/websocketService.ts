
import { 
  WsMessage, 
  WsMessageType, 
  WsVideoControlMessage,
  WsVideoChangeMessage,
  WsSyncResponseMessage
} from '@/lib/types';

// WebSocket connection class
export class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private connected: boolean = false;
  private messageHandlers: ((message: WsMessage) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  // Get singleton instance
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  // Connect to WebSocket server
  public connect(userId: string, roomId?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let url = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws?userId=${userId}`;
      
      if (roomId) {
        url += `&roomId=${roomId}`;
      }
      
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        console.log('WebSocket connected');
        resolve(true);
      };

      this.socket.onclose = (event) => {
        this.connected = false;
        console.log('WebSocket disconnected', event);
        this.attemptReconnect(userId, roomId);
        if (this.reconnectAttempts === 0) {
          reject(new Error('WebSocket connection closed'));
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error', error);
        reject(error);
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WsMessage;
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message', error);
        }
      };
    });
  }

  // Disconnect WebSocket
  public disconnect(): void {
    if (this.socket && this.connected) {
      this.socket.close();
      this.socket = null;
      this.connected = false;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  // Send message to server
  public sendMessage(message: WsMessage): void {
    if (this.socket && this.connected) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('Cannot send message: WebSocket not connected');
    }
  }

  // Join a room
  public joinRoom(roomId: string, userId: string): void {
    this.sendMessage({
      type: WsMessageType.JOIN_ROOM,
      roomId,
      senderId: userId,
      timestamp: Date.now()
    });
  }

  // Leave a room
  public leaveRoom(roomId: string, userId: string): void {
    this.sendMessage({
      type: WsMessageType.LEAVE_ROOM,
      roomId,
      senderId: userId,
      timestamp: Date.now()
    });
  }

  // Send video play state
  public sendVideoPlay(roomId: string, userId: string, currentTime: number): void {
    const message: WsVideoControlMessage = {
      type: WsMessageType.VIDEO_PLAY,
      roomId,
      senderId: userId,
      timestamp: Date.now(),
      currentTime,
      playing: true
    };
    this.sendMessage(message);
  }

  // Send video pause state
  public sendVideoPause(roomId: string, userId: string, currentTime: number): void {
    const message: WsVideoControlMessage = {
      type: WsMessageType.VIDEO_PAUSE,
      roomId,
      senderId: userId,
      timestamp: Date.now(),
      currentTime,
      playing: false
    };
    this.sendMessage(message);
  }

  // Send video seek state
  public sendVideoSeek(roomId: string, userId: string, currentTime: number, playing: boolean): void {
    const message: WsVideoControlMessage = {
      type: WsMessageType.VIDEO_SEEK,
      roomId,
      senderId: userId,
      timestamp: Date.now(),
      currentTime,
      playing
    };
    this.sendMessage(message);
  }

  // Change video
  public changeVideo(roomId: string, userId: string, videoId: string): void {
    const message: WsVideoChangeMessage = {
      type: WsMessageType.VIDEO_CHANGE,
      roomId,
      senderId: userId,
      timestamp: Date.now(),
      videoId
    };
    this.sendMessage(message);
  }

  // Request sync (when joining late)
  public requestSync(roomId: string, userId: string): void {
    this.sendMessage({
      type: WsMessageType.SYNC_REQUEST,
      roomId,
      senderId: userId,
      timestamp: Date.now()
    });
  }

  // Subscribe to messages
  public subscribe(handler: (message: WsMessage) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  // Handle incoming message
  private handleMessage(message: WsMessage): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler', error);
      }
    });
  }

  // Attempt reconnect on disconnection
  private attemptReconnect(userId: string, roomId?: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.connect(userId, roomId).catch(() => {
        // Failed reconnect is handled by onclose
      });
    }, delay);
  }
}

// Export singleton instance
export const websocketService = WebSocketService.getInstance();
