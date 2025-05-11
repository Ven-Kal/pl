import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

const BRANDS = [
  "Trek", "Giant", "Specialized", "Cannondale", "Scott",
  "Merida", "BMC", "Bianchi", "Other"
];

const YEARS = Array.from(
  { length: new Date().getFullYear() - 1999 },
  (_, i) => (new Date().getFullYear() - i).toString()
);

const CONDITIONS = ["Like New", "Good", "Fair"];
const TRANSMISSIONS = ["Non-Geared", "Single Speed", "Multi-Speed"];
const MATERIALS = ["Steel", "Aluminum", "Carbon Fiber", "Titanium"];
const SUSPENSIONS = ["None", "Front", "Full"];
const WHEEL_SIZES = ["16", "20", "24", "26", "27.5", "29", "Other"];
const SORT_OPTIONS = [
  { label: "Most Relevant", value: "relevant" },
  { label: "Recently Added", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

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
  sortBy?: string;
}

interface BicycleFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  onSortChange: (sortBy: string) => void;
}

export default function BicycleFilters({
  onFilterChange,
  onSortChange,
}: BicycleFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({});
  const [priceRange, setPriceRange] = useState([0, 50000]);

  const handleFilterChange = (key: keyof FilterValues, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Filters</CardTitle>
        <Select
          defaultValue="newest"
          onValueChange={onSortChange}
        >
          <SelectTrigger aria-label="Sort bicycles">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price Range Section */}
        <div className="space-y-4" role="group" aria-labelledby="price-range-label">
          <h3 id="price-range-label" className="font-medium">Price Range (₹)</h3>
          <div className="pt-2">
            <Slider
              min={0}
              max={50000}
              step={1000}
              value={priceRange}
              onValueChange={(value) => {
                setPriceRange(value);
                handleFilterChange("minPrice", value[0]);
                handleFilterChange("maxPrice", value[1]);
              }}
              aria-label="Price range"
            />
          </div>
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="min-price">Min</Label>
              <Input
                id="min-price"
                type="number"
                value={priceRange[0]}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setPriceRange([value, priceRange[1]]);
                  handleFilterChange("minPrice", value);
                }}
                aria-label="Minimum price"
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="max-price">Max</Label>
              <Input
                id="max-price"
                type="number"
                value={priceRange[1]}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setPriceRange([priceRange[0], value]);
                  handleFilterChange("maxPrice", value);
                }}
                aria-label="Maximum price"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Basic Info Section */}
        <div className="space-y-4" role="group" aria-labelledby="basic-info-label">
          <h3 id="basic-info-label" className="font-medium">Basic Information</h3>
          <div className="space-y-2">
            <Label htmlFor="brand-select">Brand</Label>
            <Select
              onValueChange={(value) => handleFilterChange("brand", value)}
              value={filters.brand}
            >
              <SelectTrigger id="brand-select">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {BRANDS.map((brand) => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year-select">Year of Purchase</Label>
            <Select
              onValueChange={(value) => handleFilterChange("yearOfPurchase", value)}
              value={filters.yearOfPurchase}
            >
              <SelectTrigger id="year-select">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition-select">Condition</Label>
            <Select
              onValueChange={(value) => handleFilterChange("condition", value)}
              value={filters.condition}
            >
              <SelectTrigger id="condition-select">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((condition) => (
                  <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Technical Specifications */}
        <div className="space-y-4" role="group" aria-labelledby="tech-specs-label">
          <h3 id="tech-specs-label" className="font-medium">Technical Specifications</h3>
          <div className="space-y-2">
            <Label htmlFor="transmission-select">Transmission</Label>
            <Select
              onValueChange={(value) => handleFilterChange("gearTransmission", value)}
              value={filters.gearTransmission}
            >
              <SelectTrigger id="transmission-select">
                <SelectValue placeholder="Select transmission" />
              </SelectTrigger>
              <SelectContent>
                {TRANSMISSIONS.map((transmission) => (
                  <SelectItem key={transmission} value={transmission}>{transmission}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="material-select">Frame Material</Label>
            <Select
              onValueChange={(value) => handleFilterChange("frameMaterial", value)}
              value={filters.frameMaterial}
            >
              <SelectTrigger id="material-select">
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {MATERIALS.map((material) => (
                  <SelectItem key={material} value={material}>{material}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="suspension-select">Suspension</Label>
            <Select
              onValueChange={(value) => handleFilterChange("suspension", value)}
              value={filters.suspension}
            >
              <SelectTrigger id="suspension-select">
                <SelectValue placeholder="Select suspension" />
              </SelectTrigger>
              <SelectContent>
                {SUSPENSIONS.map((suspension) => (
                  <SelectItem key={suspension} value={suspension}>{suspension}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wheel-size-select">Wheel Size</Label>
            <Select
              onValueChange={(value) => handleFilterChange("wheelSize", value)}
              value={filters.wheelSize}
            >
              <SelectTrigger id="wheel-size-select">
                <SelectValue placeholder="Select wheel size" />
              </SelectTrigger>
              <SelectContent>
                {WHEEL_SIZES.map((size) => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Clear Filters Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setFilters({});
            setPriceRange([0, 50000]);
            onFilterChange({});
            onSortChange("newest");
          }}
          aria-label="Clear all filters"
        >
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );
}
