import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Bicycle } from "@shared/schema";

interface WishlistContextType {
  wishlist: Set<number>;
  addToWishlist: (bicycleId: number) => void;
  removeFromWishlist: (bicycleId: number) => void;
  isInWishlist: (bicycleId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Load wishlist from localStorage
      const savedWishlist = localStorage.getItem(`wishlist_${user.id}`);
      if (savedWishlist) {
        setWishlist(new Set(JSON.parse(savedWishlist)));
      }
    }
  }, [user]);

  const addToWishlist = (bicycleId: number) => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to wishlist",
        variant: "destructive",
      });
      return;
    }

    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      newWishlist.add(bicycleId);
      localStorage.setItem(
        `wishlist_${user.id}`,
        JSON.stringify(Array.from(newWishlist))
      );
      return newWishlist;
    });

    toast({
      title: "Added to wishlist",
      description: "Bicycle has been added to your wishlist",
    });
  };

  const removeFromWishlist = (bicycleId: number) => {
    if (!user) return;

    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      newWishlist.delete(bicycleId);
      localStorage.setItem(
        `wishlist_${user.id}`,
        JSON.stringify(Array.from(newWishlist))
      );
      return newWishlist;
    });

    toast({
      title: "Removed from wishlist",
      description: "Bicycle has been removed from your wishlist",
    });
  };

  const isInWishlist = (bicycleId: number) => {
    return wishlist.has(bicycleId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
