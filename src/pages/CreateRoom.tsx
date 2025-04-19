
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Video } from '@/lib/types';
import { createRoom, getCurrentUser, getVideos } from '@/services/apiService';

const CreateRoom: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [roomName, setRoomName] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate a random user ID for demo purposes
  const getUserId = () => {
    const storedId = localStorage.getItem('cloudplay-user-id');
    if (storedId) return storedId;
    
    const newId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('cloudplay-user-id', newId);
    return newId;
  };

  // Fetch initial data
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
        
        // Fetch available videos
        const videosData = await getVideos();
        setVideos(videosData);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. This is a demo frontend without the required SpringBoot backend.');
        
        // For demo purposes, set some mock videos
        setVideos([
          {
            id: 'video1',
            title: 'Nature Documentary',
            description: 'Explore the wonders of nature',
            cloudinaryUrl: 'https://res.cloudinary.com/demo/video/upload/v1612344860/samples/elephants.mp4',
            thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1612344860/samples/elephants.jpg',
            duration: 320,
            createdAt: new Date().toISOString()
          },
          {
            id: 'video2',
            title: 'Ocean Life',
            description: 'Discover the mysteries of the deep blue',
            cloudinaryUrl: 'https://res.cloudinary.com/demo/video/upload/v1612344860/samples/sea-turtle.mp4',
            thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1612344860/samples/sea-turtle.jpg',
            duration: 180,
            createdAt: new Date().toISOString()
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      setError('Please enter a room name');
      return;
    }
    
    try {
      setCreating(true);
      const room = await createRoom(roomName, selectedVideoId);
      navigate(`/rooms/${room.id}`);
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. This is a demo frontend without the required SpringBoot backend.');
      
      // For demo purposes, navigate to a mock room
      setTimeout(() => {
        navigate('/rooms/new-room');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header currentUser={currentUser} />
      
      <main className="flex-1 container px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create a Room</CardTitle>
            <CardDescription>
              Set up a new viewing room and invite others to join
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent>
              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-4">
                  <p>{error}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-name">Room Name</Label>
                  <Input
                    id="room-name"
                    placeholder="My Awesome Room"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Select a Video (Optional)</Label>
                  
                  {loading ? (
                    <div className="space-y-2">
                      {Array(2).fill(0).map((_, i) => (
                        <div key={i} className="h-16 bg-muted rounded-md animate-pulse"></div>
                      ))}
                    </div>
                  ) : videos.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {videos.map(video => (
                        <div
                          key={video.id}
                          className={`p-3 rounded-md cursor-pointer border transition-colors ${
                            selectedVideoId === video.id
                              ? 'border-cloudplay bg-cloudplay/5'
                              : 'border-border hover:border-cloudplay/60'
                          }`}
                          onClick={() => setSelectedVideoId(video.id)}
                        >
                          <div className="flex items-center gap-3">
                            {video.thumbnailUrl ? (
                              <div className="w-20 h-12 bg-black rounded overflow-hidden flex-shrink-0">
                                <img
                                  src={video.thumbnailUrl}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-20 h-12 bg-black rounded flex-shrink-0 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                  <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                              </div>
                            )}
                            <div className="flex-grow min-w-0">
                              <p className="font-medium truncate">{video.title}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No videos available</p>
                  )}
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || creating}
              >
                {creating ? 'Creating...' : 'Create Room'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default CreateRoom;
