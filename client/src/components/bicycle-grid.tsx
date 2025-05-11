import { Bicycle } from "@shared/schema";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Clock } from "lucide-react";
import { Link } from "wouter";
import { useWishlist } from "@/hooks/use-wishlist";
import { useToast } from "@/hooks/use-toast";
import BicycleImageCarousel from './bicycle-image-carousel';
import { formatDistanceToNow } from 'date-fns';

interface BicycleGridProps {
  bicycles: Bicycle[];
}

export default function BicycleGrid({ bicycles }: BicycleGridProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  const handleShare = async (bicycle: Bicycle) => {
    try {
      await navigator.share({
        title: `${bicycle.brand} ${bicycle.model}`,
        text: `Check out this ${bicycle.brand} ${bicycle.model} on Pling!`,
        url: window.location.href,
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Could not share this bicycle",
        variant: "destructive",
      });
    }
  };

  const getListedTime = (createdAt: Date | null) => {
    if (!createdAt) return 'Recently';
    return formatDistanceToNow(createdAt, { addSuffix: true });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {bicycles.map((bicycle) => (
        <Link key={bicycle.id} href={`/bicycles/${bicycle.id}`}>
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="relative p-0">
              {bicycle.isPremium && (
                <Badge 
                  className="absolute top-3 right-3 z-10" 
                  variant="secondary"
                >
                  Premium
                </Badge>
              )}
              <BicycleImageCarousel images={bicycle.images} />
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-xl">
                  {bicycle.brand} {bicycle.model}
                </CardTitle>
              </div>
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <Clock className="w-4 h-4 mr-1" />
                <span>Listed {getListedTime(bicycle.createdAt)}</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Year</span>
                  <span>{bicycle.purchaseYear}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span>{bicycle.cycleType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transmission</span>
                  <span>{bicycle.gearTransmission}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frame</span>
                  <span>{bicycle.frameMaterial}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center p-6 border-t">
              <div className="flex items-center gap-3">
                <Badge variant={
                  bicycle.condition === "Like New" ? "default" :
                  bicycle.condition === "Good" ? "secondary" :
                  "outline"
                }>
                  {bicycle.condition}
                </Badge>
                <span className="text-xl font-semibold">
                  ₹{bicycle.price.toLocaleString()}
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    handleShare(bicycle);
                  }}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    if (isInWishlist(bicycle.id)) {
                      removeFromWishlist(bicycle.id);
                    } else {
                      addToWishlist(bicycle.id);
                    }
                  }}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isInWishlist(bicycle.id) ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}