
import { useEffect, useRef, useState } from 'react';
import { WsMessage, WsMessageType, WsVideoControlMessage, WsSyncResponseMessage } from '@/lib/types';
import { websocketService } from '@/services/websocketService';

interface UseWebSocketSyncProps {
  roomId: string;
  userId: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  isHost: boolean;
}

export const useWebSocketSync = ({
  roomId,
  userId,
  videoRef,
  isPlaying,
  setIsPlaying,
  currentTime,
  setCurrentTime,
  isHost
}: UseWebSocketSyncProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Control sync from other users
  const syncInProgress = useRef(false);
  
  // Track if user interaction vs sync updates
  const userInteractionInProgress = useRef(false);

  // Handle play event
  const handlePlay = () => {
    if (!videoRef.current) return;
    
    userInteractionInProgress.current = true;
    
    videoRef.current.play()
      .then(() => {
        if (isHost) {
          websocketService.sendVideoPlay(roomId, userId, videoRef.current!.currentTime);
        }
        setIsPlaying(true);
      })
      .catch(err => {
        console.error('Error playing video:', err);
      });
    
    setTimeout(() => {
      userInteractionInProgress.current = false;
    }, 100);
  };

  // Handle pause event
  const handlePause = () => {
    if (!videoRef.current) return;
    
    userInteractionInProgress.current = true;
    
    videoRef.current.pause();
    setIsPlaying(false);
    
    if (isHost) {
      websocketService.sendVideoPause(roomId, userId, videoRef.current.currentTime);
    }
    
    setTimeout(() => {
      userInteractionInProgress.current = false;
    }, 100);
  };

  // Handle seek
  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    
    userInteractionInProgress.current = true;
    
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    
    if (isHost) {
      websocketService.sendVideoSeek(roomId, userId, time, isPlaying);
    }
    
    setTimeout(() => {
      userInteractionInProgress.current = false;
    }, 100);
  };

  // Request sync when joining
  useEffect(() => {
    if (videoRef.current) {
      setIsSyncing(true);
      websocketService.requestSync(roomId, userId);
    }

    return () => {
      setIsSyncing(false);
    };
  }, [roomId, userId]);

  // Subscribe to WebSocket messages
  useEffect(() => {
    const unsubscribe = websocketService.subscribe((message: WsMessage) => {
      if (message.roomId !== roomId || message.senderId === userId) {
        return; // Ignore messages not for this room or from self
      }

      if (userInteractionInProgress.current) {
        return; // Don't apply sync during user interaction
      }

      switch (message.type) {
        case WsMessageType.VIDEO_PLAY:
          syncPlay(message as WsVideoControlMessage);
          break;
        case WsMessageType.VIDEO_PAUSE:
          syncPause(message as WsVideoControlMessage);
          break;
        case WsMessageType.VIDEO_SEEK:
          syncSeek(message as WsVideoControlMessage);
          break;
        case WsMessageType.SYNC_RESPONSE:
          handleSyncResponse(message as WsSyncResponseMessage);
          break;
        default:
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomId, userId]);

  // Sync play
  const syncPlay = (message: WsVideoControlMessage) => {
    if (!videoRef.current || syncInProgress.current) return;
    
    syncInProgress.current = true;
    
    const timeDiff = Math.abs(videoRef.current.currentTime - message.currentTime);
    
    // Sync time if difference is more than 1 second
    if (timeDiff > 1) {
      videoRef.current.currentTime = message.currentTime;
    }
    
    videoRef.current.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(error => {
        console.error("Error playing video during sync:", error);
      })
      .finally(() => {
        setTimeout(() => {
          syncInProgress.current = false;
        }, 100);
      });
  };

  // Sync pause
  const syncPause = (message: WsVideoControlMessage) => {
    if (!videoRef.current || syncInProgress.current) return;
    
    syncInProgress.current = true;
    
    videoRef.current.pause();
    setIsPlaying(false);
    
    const timeDiff = Math.abs(videoRef.current.currentTime - message.currentTime);
    
    // Sync time if difference is more than 1 second
    if (timeDiff > 1) {
      videoRef.current.currentTime = message.currentTime;
      setCurrentTime(message.currentTime);
    }
    
    setTimeout(() => {
      syncInProgress.current = false;
    }, 100);
  };

  // Sync seek
  const syncSeek = (message: WsVideoControlMessage) => {
    if (!videoRef.current || syncInProgress.current) return;
    
    syncInProgress.current = true;
    
    videoRef.current.currentTime = message.currentTime;
    setCurrentTime(message.currentTime);
    
    // Adjust play/pause state if needed
    if (message.playing && !isPlaying) {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    } else if (!message.playing && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    
    setTimeout(() => {
      syncInProgress.current = false;
    }, 100);
  };

  // Handle sync response (when joining room)
  const handleSyncResponse = (message: WsSyncResponseMessage) => {
    if (!videoRef.current || syncInProgress.current) return;
    
    syncInProgress.current = true;
    setIsSyncing(true);
    
    videoRef.current.currentTime = message.currentTime;
    setCurrentTime(message.currentTime);
    
    setTimeout(() => {
      if (message.playing) {
        videoRef.current?.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(console.error);
      } else {
        setIsPlaying(false);
      }
      
      syncInProgress.current = false;
      setIsSyncing(false);
    }, 200);
  };

  return {
    handlePlay,
    handlePause,
    handleSeek,
    isSyncing
  };
};
