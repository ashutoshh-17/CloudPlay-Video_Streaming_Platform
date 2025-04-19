
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onFullscreenToggle: () => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onFullscreenToggle
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isVolumeSliderOpen, setIsVolumeSliderOpen] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  const volumeControlRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show controls when mouse moves
  const showControls = () => {
    setIsVisible(true);
    
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setIsVisible(false);
      }
    }, 3000);
  };

  // Handle clicks outside the volume slider
  const handleClickOutside = (event: MouseEvent) => {
    if (
      volumeControlRef.current && 
      !volumeControlRef.current.contains(event.target as Node)
    ) {
      setIsVolumeSliderOpen(false);
    }
  };

  // Set up mouse move and click handlers
  useEffect(() => {
    const containerElement = controlsRef.current?.parentElement;
    
    if (containerElement) {
      containerElement.addEventListener('mousemove', showControls);
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      if (containerElement) {
        containerElement.removeEventListener('mousemove', showControls);
      }
      document.removeEventListener('mousedown', handleClickOutside);
      
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, [isPlaying]);

  return (
    <div 
      ref={controlsRef}
      className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 bg-gradient-to-t from-black/70 to-transparent ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Seek bar */}
      <div className="px-4 pt-2">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={(values) => onSeek(values[0])}
          className="h-1.5 cursor-pointer"
        />
      </div>
      
      {/* Controls */}
      <div className="p-4 flex items-center justify-between text-white">
        <div className="flex items-center space-x-4">
          {/* Play/Pause button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onPlayPause}
            className="text-white hover:bg-white/20 rounded-full w-10 h-10"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </Button>
          
          {/* Volume control */}
          <div className="relative" ref={volumeControlRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (volume === 0) {
                  onVolumeChange(1);
                } else {
                  setIsVolumeSliderOpen(!isVolumeSliderOpen);
                }
              }}
              onMouseEnter={() => setIsVolumeSliderOpen(true)}
              className="text-white hover:bg-white/20 rounded-full w-10 h-10"
            >
              {isMuted || volume === 0 ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : volume < 0.5 ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </Button>
            
            {/* Volume slider (shows on hover) */}
            {isVolumeSliderOpen && (
              <div 
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/80 p-4 rounded-lg"
                onMouseLeave={() => setIsVolumeSliderOpen(false)}
              >
                <Slider
                  orientation="vertical"
                  value={[isMuted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={(values) => onVolumeChange(values[0] / 100)}
                  className="h-24 w-2"
                />
              </div>
            )}
          </div>
          
          {/* Time display */}
          <div className="text-sm text-white/90">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Fullscreen toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onFullscreenToggle}
            className="text-white hover:bg-white/20 rounded-full w-10 h-10"
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
