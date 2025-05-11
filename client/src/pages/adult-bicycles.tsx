import { useQuery } from "@tanstack/react-query";
import { useState, Dispatch, SetStateAction } from "react";
import { Bicycle } from "@shared/schema";
import Navbar from "@/components/navbar";
import BicycleGrid from "@/components/bicycle-grid";
import BicycleFilters from "@/components/bicycle-filters";
import { Loader2 } from "lucide-react";
import SEO from "@/components/seo";

// Define the FilterValues interface for the component state
interface FilterValues {
  brand?: string;
  yearOfPurchase?: string;
  condition?: string;
  gearTransmission?: string;
  frameMaterial?: string;
  suspension?: string;
  wheelSize?: string;
  minPrice?: number;
  maxPrice?: number;
}

export default function AdultBicycles() {
  const [filters, setFilters] = useState<FilterValues>({
    minPrice: 0,
    maxPrice: 50000,  // 🎯 Adults can afford bigger budget, adjusted to ₹50,000
    wheelSize: "26",  // 🎯 Default adult wheel size (26 inch typical for adults)
  });
  const [sortBy, setSortBy] = useState("newest");

  const { data: bicycles, isLoading, error } = useQuery<Bicycle[]>({
    queryKey: ["/api/bicycles", JSON.stringify(filters), sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.brand) params.append("brand", filters.brand);
      if (filters.yearOfPurchase) params.append("yearOfPurchase", filters.yearOfPurchase);
      if (filters.condition) params.append("condition", filters.condition);
      if (filters.gearTransmission) params.append("gearTransmission", filters.gearTransmission);
      if (filters.frameMaterial) params.append("frameMaterial", filters.frameMaterial);
      if (filters.suspension) params.append("suspension", filters.suspension);
      if (filters.wheelSize) params.append("wheelSize", filters.wheelSize);
      if (filters.minPrice !== undefined) params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append("maxPrice", filters.maxPrice.toString());
  
      params.append("sortBy", sortBy);
  
      const res = await fetch(`/api/bicycles?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch adult bicycles");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Adult Bicycles for Sale | Premium Bicycles for Men & Women | Pling"
        description="Explore our wide range of adult bicycles. From road bikes to mountain bikes, find the perfect ride for your adventures."
        canonicalUrl="/adult-bicycles"
        type="website"
      />
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Adult Bicycles
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            Premium bicycles for your everyday adventures
          </p>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <a href="/" className="hover:text-primary">Home</a>
              <span className="mx-2">/</span>
            </li>
            <li className="text-foreground">Adult Bicycles</li>
          </ol>
        </nav>
      </div>

      {/* Main Content with Sidebar Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="md:w-64 flex-shrink-0">
            <h2 className="text-lg font-semibold mb-4">Filter Options</h2>
            {/* Pass the props directly as expected by the BicycleFilters component */}
            <BicycleFilters
              onFilterChange={setFilters}
              onSortChange={setSortBy}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">
                Available Adult Bicycles
              </h2>
              <p className="text-muted-foreground">
                Quality bicycles for men and women
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">Error Loading Data</h3>
                <p className="text-muted-foreground">
                  There was an issue fetching the bicycle data. Please try again later.
                </p>
              </div>
            ) : bicycles?.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No Adult Bicycles Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or check back later for new listings
                </p>
              </div>
            ) : (
              <BicycleGrid bicycles={bicycles || []} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
