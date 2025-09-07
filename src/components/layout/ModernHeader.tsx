import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Brain, Menu, User, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAdminRole } from '@/hooks/useAdminRole';
import { GuidedTour } from '@/components/help/GuidedTour';

export const ModernHeader: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminRole();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Take Test' },
    { path: '/mentor', label: 'AI Coach' },
    { path: '/history', label: 'Connection' },
    { path: '/careers', label: 'Careers' },
  ];

  const MobileNav = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-background border-border">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Psyforge</span>
            </Link>
          </div>
          
          <nav className="flex-1 space-y-2">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive(path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="border-t pt-4 space-y-2">
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
                    <User className="mr-3 h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setShowTour(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <Brain className="mr-3 h-4 w-4" />
                  Help & Tour
                </button>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <LogIn className="mr-3 h-4 w-4" />
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
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Mobile Navigation */}
        {isMobile && <MobileNav />}
        
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Brain className="h-7 w-7 text-primary" />
          <span className="font-bold text-xl hidden sm:block">Psyforge</span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive(path) ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Auth Button */}
        {!isMobile && (
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowTour(true)}>
                  Help & Tour
                </Button>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Login / Register
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
      {showTour && <GuidedTour isOpen={showTour} onClose={() => setShowTour(false)} />}
    </header>
  );
};