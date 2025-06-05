
import { useState } from "react";
import { ShoppingCart, User, LogOut } from "lucide-react";
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

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-800">SpeedySpoon</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/customer" className="text-gray-600 hover:text-orange-600 transition-colors">Menu</a>
            <a href="#about" className="text-gray-600 hover:text-orange-600 transition-colors">About</a>
            <a href="#contact" className="text-gray-600 hover:text-orange-600 transition-colors">Contact</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            {userType === 'customer' && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={onCartClick}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            )}
            
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 hidden md:block">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAuthModal(true)}
                title="Sign In"
              >
                <User className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
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
