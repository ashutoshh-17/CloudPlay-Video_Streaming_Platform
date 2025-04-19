
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Room, User } from '@/lib/types';
import { getRooms, getCurrentUser } from '@/services/apiService';

const RoomsList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate a random user ID for demo purposes
  const getUserId = () => {
    const storedId = localStorage.getItem('cloudplay-user-id');
    if (storedId) return storedId;
    
    const newId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('cloudplay-user-id', newId);
    return newId;
  };

  // Fetch rooms
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
        
        // Fetch rooms
        const roomsData = await getRooms();
        setRooms(roomsData);
        
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Failed to load rooms. This is a demo frontend without the required SpringBoot backend.');
        
        // For demo purposes, set some mock rooms
        setRooms([
          {
            id: 'room1',
            name: 'Documentary Room',
            currentVideo: null,
            viewers: 3,
            isPrivate: false
          },
          {
            id: 'room2',
            name: 'Movie Night',
            currentVideo: null,
            viewers: 8,
            isPrivate: false
          },
          {
            id: 'room3',
            name: 'Tech Talks',
            currentVideo: null,
            viewers: 5,
            isPrivate: false
          },
          {
            id: 'room4',
            name: 'Music Videos',
            currentVideo: null,
            viewers: 12,
            isPrivate: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header currentUser={currentUser} />
      
      <main className="flex-1 container px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Available Rooms</h1>
          <Link to="/create-room">
            <Button>Create Room</Button>
          </Link>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-8">
            <p>{error}</p>
          </div>
        )}
        
        {/* Rooms grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-6 bg-muted rounded-md"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-muted rounded-md"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-9 w-full bg-muted rounded-md"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => (
              <Card key={room.id}>
                <CardHeader>
                  <CardTitle>{room.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {room.viewers} {room.viewers === 1 ? 'viewer' : 'viewers'} watching
                  </p>
                  {room.currentVideo && (
                    <p className="text-sm">
                      Currently playing: <span className="font-medium">{room.currentVideo.title}</span>
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Link to={`/rooms/${room.id}`} className="w-full">
                    <Button className="w-full">Join Room</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 8h7" />
                <path d="M8 12h6" />
                <path d="M11 16h4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">No Rooms Available</h2>
            <p className="text-muted-foreground mb-6">Be the first to create a room and start watching!</p>
            <Link to="/create-room">
              <Button>Create Room</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default RoomsList;
