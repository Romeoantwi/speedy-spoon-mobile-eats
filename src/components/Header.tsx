
import { useState } from "react";
import { ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "./AuthModal";

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  userType?: 'customer' | 'driver' | 'restaurant';
}

const Header = ({ cartItemCount = 0, onCartClick, userType = 'customer' }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="bg-black/90 backdrop-blur-md shadow-lg border-b border-red-600/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/f00a84b9-d2a8-4c94-99a5-09f87a39e9ee.png" 
              alt="SpeedySpoon Logo" 
              className="h-12 w-auto"
            />
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/customer" className="text-gray-300 hover:text-red-400 transition-colors font-medium">Menu</a>
            <a href="#about" className="text-gray-300 hover:text-red-400 transition-colors font-medium">About</a>
            <a href="#contact" className="text-gray-300 hover:text-red-400 transition-colors font-medium">Contact</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            {userType === 'customer' && onCartClick && (
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-300 hover:text-red-400 hover:bg-red-600/10"
                onClick={onCartClick}
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            )}
            
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-300 hidden md:block font-medium">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="text-gray-300 hover:text-red-400 hover:bg-red-600/10"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAuthModal(true)}
                title="Sign In"
                className="text-gray-300 hover:text-red-400 hover:bg-red-600/10"
              >
                <User className="w-6 h-6" />
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-300 hover:text-red-400 hover:bg-red-600/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-red-600/30">
            <nav className="container mx-auto px-4 py-4 space-y-3">
              <a href="/customer" className="block text-gray-300 hover:text-red-400 transition-colors font-medium py-2">Menu</a>
              <a href="#about" className="block text-gray-300 hover:text-red-400 transition-colors font-medium py-2">About</a>
              <a href="#contact" className="block text-gray-300 hover:text-red-400 transition-colors font-medium py-2">Contact</a>
            </nav>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default Header;
