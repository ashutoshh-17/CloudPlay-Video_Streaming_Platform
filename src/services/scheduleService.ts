
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from '@/components/ui/use-toast';

export interface ScheduleMessage {
  type: 'SYNC' | 'START' | 'ERROR';
  roomId: string;
  video: {
    id: string;
    title: string;
    description?: string;
    cloudinaryUrl: string;
    duration: number;
  } | null;
  scheduledTime: string | null;
}

type MessageCallback = (message: ScheduleMessage) => void;

class ScheduleService {
  private client: Client | null = null;
  private connected: boolean = false;
  private roomId: string | null = null;
  private callbacks: MessageCallback[] = [];

  public connect(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.roomId = roomId;
      
      const sockJsUrl = `${window.location.protocol}//${window.location.host}/ws`;
      const socket = new SockJS(sockJsUrl);
      
      this.client = new Client({
        webSocketFactory: () => socket,
        debug: (msg) => console.debug('[STOMP]', msg),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });
      
      this.client.onConnect = () => {
        console.log('Connected to WebSocket');
        this.connected = true;
        
        // Subscribe to room topic
        this.client?.subscribe(`/topic/room/${roomId}`, (message) => {
          try {
            const scheduleMessage = JSON.parse(message.body) as ScheduleMessage;
            this.handleMessage(scheduleMessage);
          } catch (error) {
            console.error('Error parsing WebSocket message', error);
          }
        });
        
        // Request initial sync
        this.requestSync();
        resolve();
      };
      
      this.client.onStompError = (frame) => {
        console.error('STOMP Error', frame);
        toast({
          variant: 'destructive',
          title: 'Connection Error',
          description: 'Failed to connect to video sync service'
        });
        reject(new Error(frame.headers.message));
      };
      
      this.client.activate();
    });
  }

  public disconnect(): void {
    if (this.client && this.connected) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.roomId = null;
      console.log('Disconnected from WebSocket');
    }
  }

  public requestSync(): void {
    if (this.client && this.connected && this.roomId) {
      this.client.publish({
        destination: `/app/room/${this.roomId}/sync`,
        body: JSON.stringify({ roomId: this.roomId })
      });
    } else {
      console.error('Cannot request sync: WebSocket not connected');
    }
  }

  public subscribe(callback: MessageCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  private handleMessage(message: ScheduleMessage): void {
    console.log('Received WebSocket message:', message);
    
    this.callbacks.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in message handler', error);
      }
    });
    
    // Handle message types
    switch (message.type) {
      case 'SYNC':
        // Handled by callbacks
        break;
      case 'START':
        toast({
          title: 'Scheduled Video Starting',
          description: 'Your scheduled video is now playing'
        });
        break;
      case 'ERROR':
        toast({
          variant: 'destructive',
          title: 'Sync Error',
          description: 'Failed to synchronize with room'
        });
        break;
    }
  }
}

export const scheduleService = new ScheduleService();
