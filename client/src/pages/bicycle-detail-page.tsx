import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Bicycle } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Heart, Share2, Phone, ArrowLeft } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import BicycleImageCarousel from "@/components/bicycle-image-carousel";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import { useEffect } from "react";

// Define the missing ProductSchema interface
interface ProductSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  image?: string;
  offers: {
    "@type": string;
    price: string;
    priceCurrency: string;
    availability: string;
    condition: string;
  };
  brand: {
    "@type": string;
    name: string;
  };
  productionDate?: string;
}

// Type guard for Bicycle
function isBicycle(data: unknown): data is Bicycle {
  if (!data || typeof data !== 'object') return false;
  const bicycle = data as Partial<Bicycle>;
  
  return (
    typeof bicycle.id === 'number' &&
    typeof bicycle.brand === 'string' &&
    typeof bicycle.model === 'string' &&
    typeof bicycle.price === 'string' && 
    typeof bicycle.purchaseYear === 'number' &&
    typeof bicycle.category === 'string' &&
    typeof bicycle.condition === 'string' &&
    Array.isArray(bicycle.images) &&
    bicycle.images.every(image => typeof image === 'string')
  );
}

// Logger
const logger = {
  info: (message: string, data?: unknown) => console.info(`[INFO] ${message}`, data),
  error: (message: string, error?: unknown) => console.error(`[ERROR] ${message}`, error),
  warn: (message: string, data?: unknown) => console.warn(`[WARN] ${message}`, data),
};

export default function BicycleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const parsedId = id ? parseInt(id) : NaN;
  const isValidId = !isNaN(parsedId) && parsedId > 0;

  const {
    data: bicycleResponse,
    isLoading,
    error,
    isError
  } = useQuery<unknown, Error>({
    queryKey: ["bicycles", parsedId],
    enabled: isValidId,
    retry: 1,
    queryFn: async () => {
      logger.info(`Fetching bicycle with ID: ${parsedId}`);
      try {
        const res = await fetch(`/api/bicycle/details/${parsedId}`);
        if (!res.ok) {
          const errorMessage = `Failed to fetch bicycle: ${res.status} ${res.statusText}`;
          logger.error(errorMessage);
          throw new Error(errorMessage);
        }
        const result = await res.json();
        logger.info("Bicycle data fetched successfully", result);

        // Accessing the 'data' key
        return result.data;
      } catch (err) {
        logger.error("Error fetching bicycle data", err);
        throw err;
      }
    },
  });

  // Debugging: log the fetched data
  useEffect(() => {
    logger.info("Fetched bicycle data:", bicycleResponse);
  }, [bicycleResponse]);

  const bicycle: Bicycle | null = isBicycle(bicycleResponse) ? bicycleResponse : null;

  useEffect(() => {
    if (bicycleResponse && !bicycle) {
      logger.warn("Received data does not match Bicycle type", bicycleResponse);
    }
  }, [bicycleResponse, bicycle]);

  const handleShare = async () => {
    if (!bicycle) {
      logger.warn("Share attempted without bicycle data");
      return;
    }

    const title = `${bicycle.brand || ''} ${bicycle.model || ''}`.trim() || "Bicycle on Pling";
    const shareText = `Check out this ${title} on Pling!`;
    const shareUrl = window.location.href;

    logger.info("Sharing bicycle", { title, shareText, shareUrl });

    try {
      await navigator.share({ title, text: shareText, url: shareUrl });
      logger.info("Share successful");
    } catch (error) {
      logger.error("Share failed", error);
      toast({
        title: "Share failed",
        description: "Could not share this bicycle",
        variant: "destructive",
      });
    }
  };

  const handleContact = () => {
    if (!bicycle) {
      logger.warn("Contact attempted without bicycle data");
      return;
    }

    logger.info("Contact seller initiated", { bicycleId: bicycle.id });
    toast({
      title: "Contact Request Sent",
      description: "The seller will be notified of your interest. They will contact you soon.",
    });
  };

  const handleWishlistToggle = () => {
    if (!bicycle) {
      logger.warn("Wishlist toggle attempted without bicycle data");
      return;
    }

    const bicycleId = bicycle.id;
    const isCurrentlyInWishlist = isInWishlist(bicycleId);

    logger.info("Wishlist toggle", {
      bicycleId,
      action: isCurrentlyInWishlist ? "remove" : "add"
    });

    if (isCurrentlyInWishlist) {
      removeFromWishlist(bicycleId);
    } else {
      addToWishlist(bicycleId);
    }
  };

  const generateProductSchema = (bicycle: Bicycle): ProductSchema => {
    logger.info("Generating product schema");

    const brand = bicycle.brand || "Unknown Brand";
    const model = bicycle.model || "Unknown Model";
    const name = `${brand} ${model}`.trim();

    const condition = bicycle.condition || "Used";
    const cycleType = bicycle.cycleType || "bicycle";
    const description = bicycle.additionalDetails || `${condition} ${cycleType} bicycle`;

    const schemaObj: ProductSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name,
      description,
      image: bicycle.images?.[0],
      offers: {
        "@type": "Offer",
        price: bicycle.price,
        priceCurrency: "INR",
        availability: bicycle.status === "active" ? "InStock" : "OutOfStock",
        condition: `https://schema.org/${condition.replace(/\s+/g, "")}`,
      },
      brand: {
        "@type": "Brand",
        name: brand,
      },
    };

    if (bicycle.purchaseYear) {
      schemaObj.productionDate = bicycle.purchaseYear.toString();
    }

    return schemaObj;
  };

  const LoadingOrError = ({ isLoading, error }: { isLoading: boolean; error: unknown }) => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-sm mb-6 hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to listings
        </Link>
        <div className="flex items-center justify-center min-h-[400px]">
          {isLoading ? (
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
          ) : (
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Error Loading Bicycle</h1>
              <p className="text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "Unable to load bicycle details. Please try again later."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading || isError || !bicycle) {
    return <LoadingOrError isLoading={isLoading} error={error} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:py-8">
        <Link href="/" className="inline-flex items-center text-sm mb-6 hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to listings
        </Link>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <div>
            <BicycleImageCarousel images={bicycle.images ?? []} thumbnailSize={false} />
          </div>

          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {bicycle.brand || ''} {bicycle.model || ''}
                </h1>
                <p className="text-xl md:text-2xl font-semibold mt-2">
                  ₹{bicycle.price?.toLocaleString() ?? "Price not available"}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleWishlistToggle}>
                  <Heart
                    className={`h-5 w-5 ${isInWishlist(bicycle.id) ? "fill-red-500 text-red-500" : ""}`}
                  />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Category" value={bicycle.category} />
              <DetailItem
                label="Year"
                value={bicycle.purchaseYear ? bicycle.purchaseYear.toString() : undefined}
              />
              <DetailItem label="Transmission" value={bicycle.gearTransmission} />
              <DetailItem label="Frame" value={bicycle.frameMaterial} />
              <DetailItem label="Suspension" value={bicycle.suspension} />
            </div>

            <Button onClick={handleContact}>
              <Phone className="mr-2 h-4 w-4" /> Contact Seller
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="p-3 bg-muted rounded-lg">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? "N/A"}</p>
    </div>
  );
}
