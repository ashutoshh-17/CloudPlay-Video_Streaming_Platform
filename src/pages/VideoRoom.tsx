
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Room, User, Video } from '@/lib/types';
import { getRoomById, getCurrentUser, getVideoById } from '@/services/apiService';
import { websocketService } from '@/services/websocketService';
import { scheduleService, ScheduleMessage } from '@/services/scheduleService';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const VideoRoom: React.FC = () => {
  const params = useParams<{ id: string }>();
  const roomId = params.id || '';
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [joining, setJoining] = useState(true);
  const [scheduled, setScheduled] = useState<string | null>(null);

  // Generate a random user ID for demo purposes
  const getUserId = () => {
    const storedId = localStorage.getItem('cloudplay-user-id');
    if (storedId) return storedId;
    
    const newId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('cloudplay-user-id', newId);
    return newId;
  };

  // Fetch room and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try to get current user (if authentication is implemented)
        const user = await getCurrentUser();
        
        // If no authenticated user, create a temporary one for demo
        if (!user) {
          const userId = getUserId();
          const tempUser: User = {
            id: userId,
            name: `Guest ${userId.substring(0, 4)}`,
          };
          setCurrentUser(tempUser);
        } else {
          setCurrentUser(user);
        }
        
        // Fetch room data
        const roomData = await getRoomById(roomId);
        setRoom(roomData);
        
        // Set scheduled time if available
        if (roomData.scheduledTime) {
          setScheduled(roomData.scheduledTime);
        }
        
        // Fetch video if room has one
        if (roomData.currentVideo) {
          const videoData = await getVideoById(roomData.currentVideo.id);
          setCurrentVideo(videoData);
        }
        
        // Determine if the user is the host (first to join)
        setIsHost(roomData.viewers === 0);
        
      } catch (err) {
        console.error('Error fetching room data:', err);
        setError('Failed to load room. This is a demo frontend without the required SpringBoot backend.');
        
        // For demo purposes, create a mock room and video
        setRoom({
          id: roomId,
          name: 'Demo Room',
          currentVideo: {
            id: 'video1',
            title: 'Demo Video',
            description: 'This is a demo video for CloudPlay',
            cloudinaryUrl: 'https://res.cloudinary.com/demo/video/upload/v1612344860/samples/elephants.mp4',
            duration: 180,
            createdAt: new Date().toISOString(),
          },
          viewers: 1,
          isPrivate: false
        });
        
        setCurrentVideo({
          id: 'video1',
          title: 'Demo Video',
          description: 'This is a demo video for CloudPlay',
          cloudinaryUrl: 'https://res.cloudinary.com/demo/video/upload/v1612344860/samples/elephants.mp4',
          duration: 180,
          createdAt: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Cleanup
    return () => {
      // Leave WebSocket room if connected
      if (currentUser && connected) {
        websocketService.leaveRoom(roomId, currentUser.id);
        websocketService.disconnect();
      }
      scheduleService.disconnect();
    };
  }, [roomId]);

  // Connect to WebSocket when user data is available
  useEffect(() => {
    if (!currentUser || !room) return;
    
    const connectToWebSockets = async () => {
      try {
        setJoining(true);
        
        // Connect to video sync WebSocket
        await websocketService.connect(currentUser.id, roomId);
        setConnected(true);
        
        // Join room via WebSocket
        websocketService.joinRoom(roomId, currentUser.id);
        
        // Connect to schedule service
        await scheduleService.connect(roomId);
        
        // Subscribe to schedule messages
        const unsubscribe = scheduleService.subscribe((message: ScheduleMessage) => {
          if (message.type === 'SYNC') {
            if (message.scheduledTime) {
              setScheduled(message.scheduledTime);
            }
            
            if (message.video && (!currentVideo || currentVideo.id !== message.video.id)) {
              setCurrentVideo(message.video as Video);
            }
          } else if (message.type === 'START') {
            // Auto-play video when scheduled time is reached
            const videoElement = document.querySelector('video');
            if (videoElement) {
              videoElement.play().catch(console.error);
            }
            toast({
              title: "It's time!",
              description: "The scheduled video is starting now"
            });
          }
        });
        
        // Clean up subscription
        return () => unsubscribe();
        
      } catch (err) {
        console.error('Failed to connect to WebSocket:', err);
        setError('Failed to connect to sync service. Some features may not work properly.');
      } finally {
        setJoining(false);
      }
    };
    
    connectToWebSockets();
  }, [currentUser, room, roomId, currentVideo]);

  if (loading || joining) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header currentUser={currentUser} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cloudplay mx-auto"></div>
            <p className="mt-4 text-lg">
              {loading ? 'Loading room...' : 'Joining room...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header currentUser={currentUser} />
        <div className="flex-1 container px-4 py-8 flex items-center justify-center">
          <Card className="w-full max-w-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Error</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Link to="/">
                  <Button>Return to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header currentUser={currentUser} />
      
      <main className="flex-1 container px-4 py-6">
        {/* Room header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">{room?.name}</h1>
            
            <div className="flex items-center gap-2">
              <span className="text-sm px-2 py-1 bg-green-500/10 text-green-500 rounded-full">
                {room?.viewers || 1} {(room?.viewers || 1) === 1 ? 'viewer' : 'viewers'}
              </span>
              
              <Link to="/rooms">
                <Button variant="outline" size="sm">
                  Leave Room
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scheduled time indicator */}
        {scheduled && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-200 rounded-md text-blue-700 dark:text-blue-300">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Scheduled to play: {format(new Date(scheduled), 'PPpp')}
            </p>
          </div>
        )}
        
        {/* Error notification */}
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {/* Video player */}
        <div className="mb-6">
          {currentVideo ? (
            <VideoPlayer 
              videoUrl={currentVideo.cloudinaryUrl} 
              roomId={roomId}
              userId={currentUser?.id || ''}
              isHost={isHost}
            />
          ) : (
            <div className="aspect-video bg-card rounded-lg flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">No video selected</p>
                {isHost && (
                  <Button className="mt-4">Select Video</Button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Video information */}
        {currentVideo && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">{currentVideo.title}</h2>
            {currentVideo.description && (
              <p className="text-muted-foreground">{currentVideo.description}</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default VideoRoom;
