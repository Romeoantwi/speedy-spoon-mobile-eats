
import { useState, useEffect } from 'react';

export const useRestaurantStatus = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = () => {
      try {
        const status = localStorage.getItem('restaurantOpen');
        setIsOpen(status !== 'false'); // Default to open if not set
      } catch (error) {
        console.error('Error checking restaurant status:', error);
        setIsOpen(true); // Default to open on error
      } finally {
        setLoading(false);
      }
    };

    checkStatus();

    // Check status every 30 seconds to sync with admin changes
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return { isOpen, loading };
};
