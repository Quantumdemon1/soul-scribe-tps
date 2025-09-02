import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Settings, User, Home, History, BookOpen, HelpCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { GuidedTour } from '@/components/help/GuidedTour';

export const Header: React.FC = () => {
  const location = useLocation();
  const [showTour, setShowTour] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">PersonalityTest</span>
          </Link>
        </div>
        
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link 
                to="/" 
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 px-4 py-2",
                  isActive('/') ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Home className="w-4 h-4 mr-2" />
                Assessment
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link 
                to="/history" 
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 px-4 py-2",
                  isActive('/history') ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-background data-[state=open]:bg-accent">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-popover border border-border shadow-lg rounded-md p-2 min-w-[200px]">
                <div className="grid gap-1">
                  <Link to="/auth">
                    <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <User className="w-4 h-4 mb-1" />
                      <div className="text-sm font-medium leading-none">User Account</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Login or create an account
                      </p>
                    </NavigationMenuLink>
                  </Link>
                  
                  <Link to="/admin">
                    <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <Settings className="w-4 h-4 mb-1" />
                      <div className="text-sm font-medium leading-none">Admin Panel</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Configure assessment settings
                      </p>
                    </NavigationMenuLink>
                  </Link>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTour(true)}
          className="ml-2"
        >
          <HelpCircle className="w-4 h-4" />
        </Button>
      </div>
      
      <GuidedTour 
        isOpen={showTour} 
        onClose={() => setShowTour(false)} 
      />
    </header>
  );
};