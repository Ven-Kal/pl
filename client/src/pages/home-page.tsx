import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bicycle } from "@shared/schema";
import Navbar from "@/components/navbar";
import BicycleGrid from "@/components/bicycle-grid";
import LocationDialog from "@/components/location-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const BANNER_IMAGES = [
    {
        url: "/assets/bicycles/image1.jpg",
        title: "Find Your Perfect Ride",
        subtitle: "Explore our curated collection of premium bicycles",
        width: 1920,
        height: 400
    },
    {
        url: "/assets/bicycles/image2.jpg",
        title: "Quality Assured",
        subtitle: "Every bicycle is verified by our experts",
        width: 1920,
        height: 400
    },
    {
        url: "/assets/bicycles/image3.jpeg",
        title: "Sell With Confidence",
        subtitle: "Join our trusted community of sellers",
        width: 1920,
        height: 400
    },
    {
        url: "/assets/bicycles/image4.jpeg",
        title: "List Your Bike with Ease",
        subtitle: "Showcase your bike to the right audience",
        width: 1920,
        height: 400
    },
    {
        url: "/assets/bicycles/image5.jpg",
        title: "Reach More Riders",
        subtitle: "Tap into a growing marketplace of bike lovers",
        width: 1920,
        height: 400
    },
    {
        url: "/assets/bicycles/image6.jpg",
        title: "Trusted By Thousands",
        subtitle: "Buy and sell bikes with peace of mind",
        width: 1920,
        height: 400
    }
];

const bicycleImages = [
    {
        id: 1,
        imageUrl: "",
        title: "Hybrid Bike",
        description: "Perfect for city commuting and weekend adventures."
    },
    {
        id: 2,
        imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
        title: "Mountain Bike",
        description: "Built for rough terrain and challenging trails."
    },
];

export default function HomePage() {
    const [currentBanner, setCurrentBanner] = useState(0);
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const nextBanner = (currentBanner + 1) % BANNER_IMAGES.length;

    // Fetch bicycles based on geolocation
    const { data: bicycles, isLoading } = useQuery<Bicycle[]>({
        queryKey: ["/api/hey"],
        queryFn: async () => {
          const res = await fetch("/api/hey");
      
          if (!res.ok) throw new Error("Failed to fetch bicycles");
      
          return res.json();
        },
        retry: false,
        refetchOnWindowFocus: false,
      });
      

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBanner((current) =>
                current === BANNER_IMAGES.length - 1 ? 0 : current + 1
            );
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Preload the next banner image to reduce transition delay
        const img = new Image();
        img.src = BANNER_IMAGES[nextBanner].url;
    }, [currentBanner, nextBanner]);

    const handleImageError = (url: string) => {
        console.error(`Failed to load image: ${url}`);
        setImageErrors((prev) => ({ ...prev, [url]: true }));
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Banner */}
            <section className="relative w-full aspect-video overflow-hidden">
                <div className="relative h-full transition-transform duration-1000 ease-in-out flex" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
                    {BANNER_IMAGES.map((banner, index) => (
                        <div key={index} className="w-full flex-shrink-0 relative h-full">
                            {!imageErrors[banner.url] ? (
                                <img
                                    src={banner.url}
                                    alt={banner.title}
                                    className="w-full h-full object-cover"
                                    onError={() => handleImageError(banner.url)}
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                    <p className="text-gray-600">Image not available</p>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6 z-10">
                                <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg">{banner.title}</h1>
                                <p className="text-lg md:text-xl mt-2 opacity-90">{banner.subtitle}</p>
                                <div className="mt-6 flex gap-4">
                                    <Button size="lg" variant="default">Browse Bicycles</Button>
                                    <Button size="lg" variant="secondary">Sell Your Bicycle</Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                    {BANNER_IMAGES.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentBanner(idx)}
                            className={`w-3 h-3 rounded-full transition-all ${currentBanner === idx ? "bg-white" : "bg-white/50"
                                }`}
                            aria-label={`Go to banner ${idx + 1}`}
                        />
                    ))}
                </div>
            </section>

            {/* Bicycle Preview */}
            <section className="my-16">
                <h2 className="text-3xl font-bold text-center mb-8">Browse Our Bicycles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
                    {bicycleImages.map((bicycle) => (
                        <div
                            key={bicycle.id}
                            className="relative overflow-hidden rounded-2xl shadow-md group"
                        >
                            {!imageErrors[bicycle.imageUrl] ? (
                                <img
                                    src={bicycle.imageUrl}
                                    alt={bicycle.title}
                                    className="w-full h-[250px] sm:h-[300px] object-cover transform transition-transform duration-500 group-hover:scale-105"
                                    onError={() => handleImageError(bicycle.imageUrl)}
                                />
                            ) : (
                                <div className="w-full h-[250px] sm:h-[300px] bg-gray-300 flex items-center justify-center">
                                    <p className="text-gray-600">{bicycle.title} (Image not available)</p>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-4 text-center">
                                <h3 className="text-xl font-semibold">{bicycle.title}</h3>
                                <p className="mt-2 text-sm">{bicycle.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/*  */}

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <section className="mb-12" aria-labelledby="featured-bicycles">
                    <h2 id="featured-bicycles" className="text-2xl font-bold mb-6">Featured Bicycles</h2>
                    {isLoading ? (
                        <div className="flex justify-center py-12" role="status" aria-label="Loading bicycles">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="sr-only">Loading bicycles...</span>
                        </div>
                    ) : (
                        <BicycleGrid bicycles={bicycles || []} />
                    )}
                </section>

                {/* Features Section */}
                <section className="mb-12 py-12 bg-muted rounded-lg" aria-labelledby="why-choose">
                    <div className="container mx-auto px-4">
                        <h2 id="why-choose" className="text-2xl font-bold mb-8 text-center">
                            Why Choose Pling?
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <article>
                                <h3 className="font-semibold mb-2">Verified Sellers</h3>
                                <p className="text-muted-foreground">
                                    Every seller is verified to ensure a safe buying experience
                                </p>
                            </article>
                            <article>
                                <h3 className="font-semibold mb-2">Quality Assurance</h3>
                                <p className="text-muted-foreground">
                                    Each bicycle undergoes a thorough quality check
                                </p>
                            </article>
                            <article>
                                <h3 className="font-semibold mb-2">Secure Transactions</h3>
                                <p className="text-muted-foreground">
                                    Safe and secure payment options for peace of mind
                                </p>
                            </article>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-100 py-12" role="contentinfo">
                <div className="container mx-auto px-4">
                    <nav className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="font-semibold mb-4">About</h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="/about" className="hover:text-primary">
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a href="/how-it-works" className="hover:text-primary">
                                        How It Works
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Support</h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="/faq" className="hover:text-primary">
                                        FAQ
                                    </a>
                                </li>
                                <li>
                                    <a href="/contact" className="hover:text-primary">
                                        Contact Us
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
