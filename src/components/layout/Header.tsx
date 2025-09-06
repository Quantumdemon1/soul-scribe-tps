import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Settings, User, Home, History, BookOpen, HelpCircle, LogOut, Brain, Menu, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { GuidedTour } from '@/components/help/GuidedTour';
import { useAuth } from '@/hooks/useAuth';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useIsMobile } from '@/hooks/use-mobile';

export const Header: React.FC = () => {
  const location = useLocation();
  const [showTour, setShowTour] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminRole();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Assessment', icon: Home },
    { path: '/history', label: 'History', icon: History },
    { path: '/mentor', label: 'AI Mentor', icon: Brain },
  ];

  const MobileNav = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold">TPS Assessment</span>
            </Link>
          </div>
          
          <nav className="flex-1 space-y-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive(path)
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className="mr-3 h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="border-t pt-4 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowTour(true);
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              <HelpCircle className="w-4 h-4 mr-3" />
              Help & Tour
            </Button>
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <User className="mr-3 h-4 w-4" />
                  Profile
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <Shield className="mr-3 h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <User className="mr-3 h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Mobile Navigation */}
        {isMobile && <MobileNav />}
        
        {/* Desktop Navigation */}
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              TPS Assessment
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  isActive(path) ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Logo (center) */}
        {isMobile && (
          <div className="flex-1 flex justify-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold text-sm">TPS</span>
            </Link>
          </div>
        )}

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTour(true)}
              className="ml-2"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          )}
          
          {!isMobile && (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-background data-[state=open]:bg-accent">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-popover border border-border shadow-lg rounded-md p-2 min-w-[200px]">
                    <div className="grid gap-1">
                      {user ? (
                        <>
                          <Link to="/profile">
                            <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                              <User className="w-4 h-4 mb-1" />
                              <div className="text-sm font-medium leading-none">Profile</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Manage your account settings
                              </p>
                            </NavigationMenuLink>
                          </Link>
                          
                          {isAdmin && (
                            <Link to="/admin">
                              <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                                <Shield className="w-4 h-4 mb-1" />
                                <div className="text-sm font-medium leading-none">Admin Panel</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  Configure assessment settings
                                </p>
                              </NavigationMenuLink>
                            </Link>
                          )}

                          <button onClick={signOut} className="w-full">
                            <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                              <LogOut className="w-4 h-4 mb-1" />
                              <div className="text-sm font-medium leading-none">Sign Out</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Sign out of your account
                              </p>
                            </NavigationMenuLink>
                          </button>
                        </>
                      ) : (
                        <Link to="/auth">
                          <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <User className="w-4 h-4 mb-1" />
                            <div className="text-sm font-medium leading-none">Sign In</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Login or create an account
                            </p>
                          </NavigationMenuLink>
                        </Link>
                      )}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </div>
      </div>
      
      <GuidedTour 
        isOpen={showTour} 
        onClose={() => setShowTour(false)} 
      />
    </header>
  );
};