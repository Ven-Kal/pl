import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const CITIES = {
  "Mumbai": ["Navi Mumbai", "Greater Mumbai", "Thane", "South Mumbai"],
  "Delhi": ["North Delhi", "South Delhi", "East Delhi", "West Delhi"],
  "Bangalore": ["Central Bangalore", "Electronic City", "Whitefield"],
};

type LocationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: string) => void;
};

export default function LocationDialog({
  open,
  onOpenChange,
  onLocationSelect,
}: LocationDialogProps) {
  const [selectedCity, setSelectedCity] = useState<keyof typeof CITIES | "">("");
  const [selectedSubCity, setSelectedSubCity] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Your Location</DialogTitle>
          <DialogDescription>
            Choose your city to see relevant bicycle listings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <Select
            value={selectedCity}
            onValueChange={(value: keyof typeof CITIES) => {
              setSelectedCity(value);
              setSelectedSubCity("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(CITIES).map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCity && (
            <Select
              value={selectedSubCity}
              onValueChange={(value) => {
                setSelectedSubCity(value);
                onLocationSelect(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {CITIES[selectedCity].map((subCity) => (
                  <SelectItem key={subCity} value={subCity}>
                    {subCity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
