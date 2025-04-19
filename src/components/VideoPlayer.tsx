
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { VideoControls } from './VideoControls';
import { WsMessage, WsMessageType, WsVideoControlMessage, WsSyncResponseMessage } from '@/lib/types';
import { websocketService } from '@/services/websocketService';

interface VideoPlayerProps {
  videoUrl: string | null;
  roomId: string;
  userId: string;
  isHost: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  roomId, 
  userId,
  isHost 
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Control sync from other users
  const syncInProgress = useRef(false);
  
  // Track if user interaction vs sync updates
  const userInteractionInProgress = useRef(false);

  // Handle video playback
  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    
    userInteractionInProgress.current = true;
    
    if (isPlaying) {
      videoRef.current.pause();
      websocketService.sendVideoPause(roomId, userId, videoRef.current.currentTime);
    } else {
      videoRef.current.play()
        .then(() => {
          websocketService.sendVideoPlay(roomId, userId, videoRef.current.currentTime);
        })
        .catch(err => {
          console.error('Error playing video:', err);
        });
    }
    
    setTimeout(() => {
      userInteractionInProgress.current = false;
    }, 100);
  }, [isPlaying, roomId, userId]);

  // Handle seek
  const handleSeek = useCallback((time: number) => {
    if (!videoRef.current) return;
    
    userInteractionInProgress.current = true;
    setIsSeeking(true);
    
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    
    websocketService.sendVideoSeek(roomId, userId, time, isPlaying);
    
    setTimeout(() => {
      userInteractionInProgress.current = false;
      setIsSeeking(false);
    }, 100);
  }, [isPlaying, roomId, userId]);

  // Handle volume change
  const handleVolumeChange = useCallback((value: number) => {
    if (!videoRef.current) return;
    setVolume(value);
    videoRef.current.volume = value;
    setIsMuted(value === 0);
  }, []);

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    if (!videoRef.current) return;
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    videoRef.current.muted = newMuteState;
  }, [isMuted]);

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Sync video with others via WebSocket
  useEffect(() => {
    // When joining, request current playback state
    if (videoRef.current && videoUrl) {
      setIsSyncing(true);
      websocketService.requestSync(roomId, userId);
    }

    // Subscribe to WebSocket messages
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
  }, [roomId, userId, videoUrl]);

  // Sync play
  const syncPlay = useCallback((message: WsVideoControlMessage) => {
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
  }, []);

  // Sync pause
  const syncPause = useCallback((message: WsVideoControlMessage) => {
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
  }, []);

  // Sync seek
  const syncSeek = useCallback((message: WsVideoControlMessage) => {
    if (!videoRef.current || syncInProgress.current) return;
    
    syncInProgress.current = true;
    setIsSeeking(true);
    
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
      setIsSeeking(false);
    }, 100);
  }, [isPlaying]);

  // Handle sync response (when joining room)
  const handleSyncResponse = useCallback((message: WsSyncResponseMessage) => {
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
  }, []);

  // Handle video events
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const onPlay = () => {
      if (!syncInProgress.current && !userInteractionInProgress.current && isHost) {
        websocketService.sendVideoPlay(roomId, userId, videoElement.currentTime);
      }
      setIsPlaying(true);
    };

    const onPause = () => {
      if (!syncInProgress.current && !userInteractionInProgress.current && isHost) {
        websocketService.sendVideoPause(roomId, userId, videoElement.currentTime);
      }
      setIsPlaying(false);
    };

    const onTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(videoElement.currentTime);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };

    const onWaiting = () => {
      setIsBuffering(true);
    };

    const onCanPlay = () => {
      setIsBuffering(false);
    };

    // Add event listeners
    videoElement.addEventListener('play', onPlay);
    videoElement.addEventListener('pause', onPause);
    videoElement.addEventListener('timeupdate', onTimeUpdate);
    videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
    videoElement.addEventListener('waiting', onWaiting);
    videoElement.addEventListener('canplay', onCanPlay);

    // Clean up
    return () => {
      videoElement.removeEventListener('play', onPlay);
      videoElement.removeEventListener('pause', onPause);
      videoElement.removeEventListener('timeupdate', onTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
      videoElement.removeEventListener('waiting', onWaiting);
      videoElement.removeEventListener('canplay', onCanPlay);
    };
  }, [isHost, roomId, userId, isSeeking]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
    >
      {/* Show loading state when no video */}
      {!videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cloudplay mx-auto"></div>
            <p className="mt-4">Waiting for video...</p>
          </div>
        </div>
      )}
      
      {/* Show sync indicator */}
      {isSyncing && (
        <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm">
          Syncing...
        </div>
      )}

      {/* Video element */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          playsInline
        />
      )}

      {/* Buffering indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cloudplay"></div>
        </div>
      )}

      {/* Video controls */}
      <VideoControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={handleMuteToggle}
        onFullscreenToggle={handleFullscreenToggle}
      />
    </div>
  );
};
