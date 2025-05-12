
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types';
import { ThemeToggle } from './ThemeToggle';
import { LogIn, UserPlus } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
}

export const Header: React.FC<HeaderProps> = ({ currentUser }) => {
  const navigate = useNavigate();

  // const handleLogout = () => {
  //   // Clear JSESSIONID cookie
  //   document.cookie = 'JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  //   // Reload the page to reset the application state
  //   window.location.reload();
  // };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 sticky top-0 z-20">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="text-cloudplay p-1.5 rounded-md bg-gray-900">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M18 7c0-1.7-1.3-3-3-3h-4a3 3 0 0 0-3 3v10c0 1.7 1.3 3 3 3h4a3 3 0 0 0 3-3v-2" />
              <path d="m16 10 5-3-5-3v6z" />
            </svg>
          </div>
          <span className="font-semibold text-xl">CloudPlay</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-foreground/70 hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/rooms" className="text-foreground/70 hover:text-foreground transition-colors">
            Rooms
          </Link>
        </nav>

        {/* User Controls */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {currentUser ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground/70">
                {currentUser.name}
              </span>
              {currentUser.avatar && (
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                </div>
              )}
              <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={async () => {
                      try {
                        const res = await fetch('http://localhost:8080/api/users/logout', {
                          method: 'POST',
                          credentials: 'include',
                        });

                        if (res.ok) {
                          // Logout was successful, now refresh
                          window.location.reload();
                        } else {
                          console.error('Logout failed with status:', res.status);
                        }
                      } catch (error) {
                        console.error('Logout failed:', error);
                      }
                    }}
                  >
                Logout
              </Button>


            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/register')}>
                <UserPlus className="mr-2 h-4 w-4" /> Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
