
import { ShoppingCart, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  userType?: 'customer' | 'driver';
}

const Header = ({ cartItemCount = 0, onCartClick, userType = 'customer' }: HeaderProps) => {
  return (
    <header className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-orange-500 text-white p-2 rounded-lg">
              <span className="text-xl font-bold">SS</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">SpeedySpoon</h1>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/customer" className="text-gray-600 hover:text-orange-600 transition-colors">
              Menu
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-orange-600 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-orange-600 transition-colors">
              Contact
            </Link>
            {userType === 'customer' && (
              <Link to="/driver-signup" className="text-gray-600 hover:text-orange-600 transition-colors">
                Drive with us
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {userType === 'driver' && (
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-2 -right-2 w-4 h-4 p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>
            )}
            
            {userType === 'customer' && onCartClick && (
              <Button
                onClick={onCartClick}
                variant="ghost"
                size="icon"
                className="relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            )}

            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
