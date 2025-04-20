import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Room, User, Video } from '@/lib/types';
import { getCurrentUser, getRooms, getVideos } from '@/services/apiService';

const Index: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try to get current user (if authenticated)
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        // Fetch rooms and videos
        const [roomsData, videosData] = await Promise.all([
          getRooms(),
          getVideos()
        ]);
        
        setRooms(roomsData);
        setVideos(videosData);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please check if the backend server is running.');
        
        // For demo purposes, set some mock data when backend is not available
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
        {/* Hero section */}
        <section className="py-10 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to CloudPlay</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Synchronized video streaming platform. Watch videos together with 
            friends in perfect sync, even when joining late.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link to="/rooms">
              <Button className="bg-cloudplay hover:bg-cloudplay-dark">
                Join a Room
              </Button>
            </Link>
            <Link to="/create-room">
              <Button variant="outline">
                Create Room
              </Button>
            </Link>
          </div>
        </section>
        
        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-8">
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-1">
              This frontend is designed to connect to a SpringBoot backend that implements WebSocket for video synchronization.
            </p>
          </div>
        )}
        
        {/* Active rooms section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Active Rooms</h2>
            <Link to="/rooms">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-muted rounded-md"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded-md"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-9 w-full bg-muted rounded-md"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.slice(0, 3).map(room => (
                <Card key={room.id}>
                  <CardHeader>
                    <CardTitle>{room.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {room.viewers} {room.viewers === 1 ? 'viewer' : 'viewers'} watching
                    </p>
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
            <div className="text-center py-8">
              <p className="text-muted-foreground">No active rooms right now</p>
              <Link to="/create-room" className="mt-4 inline-block">
                <Button>Create a Room</Button>
              </Link>
            </div>
          )}
        </section>
        
        {/* How it works section */}
        <section className="py-8">
          <h2 className="text-2xl font-semibold mb-6">How CloudPlay Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-card">
              <div className="w-12 h-12 rounded-full bg-cloudplay/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cloudplay">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m10 8 6 4-6 4V8Z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Join or Create</h3>
              <p className="text-muted-foreground">Join an existing room or create your own to start watching videos with others.</p>
            </div>
            
            <div className="p-6 rounded-lg bg-card">
              <div className="w-12 h-12 rounded-full bg-cloudplay/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cloudplay">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Perfect Synchronization</h3>
              <p className="text-muted-foreground">Our WebSocket technology keeps everyone in sync, even when joining late.</p>
            </div>
            
            <div className="p-6 rounded-lg bg-card">
              <div className="w-12 h-12 rounded-full bg-cloudplay/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cloudplay">
                  <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Shared Experience</h3>
              <p className="text-muted-foreground">Watch together with friends and family, no matter where they are.</p>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="py-6 border-t border-border">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2025 CloudPlay. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
