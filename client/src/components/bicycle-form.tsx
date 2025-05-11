"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBicycleSchema, type InsertBicycle } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import cn from "classnames";
import { Checkbox } from "@/components/ui/checkbox";

// Predefined values for select options
const BRANDS = [
  "Trek", "Giant", "Specialized", "Cannondale", "Scott", "Merida", "BMC", "Bianchi", "Other"
];
const insertBicycleSchemaFrontend=insertBicycleSchema.omit({ sellerId: true, images: true })
const YEARS = Array.from(
  { length: new Date().getFullYear() - 1999 },
  (_, i) => (new Date().getFullYear() - i).toString()
);

export default function BicycleForm() {
  const { toast } = useToast();
  const [showCustomBrand, setShowCustomBrand] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<InsertBicycle>({
    resolver: zodResolver(insertBicycleSchemaFrontend),
    defaultValues: {
      category: "Adult",
      brand: "Trek",
      model: "Marlin 5",
      purchaseYear: 2022,
      price: 599.99,
      gearTransmission: "Multi-Speed",
      frameMaterial: "Aluminum",
      suspension: "Front",
      condition: "Good",
      cycleType: "Mountain",
      wheelSize: "29",
      hasReceipt: true,
      additionalDetails: "Barely used, great for trails.",
      isPremium: false,
      status: "active"
    },
  });
  const onSubmit = form.handleSubmit(
    (data) => {
      console.log("✅ Valid data submitting:", data);
      mutate(data);
    },
    (errors) => {
      console.error("❌ Validation errors:", errors);
    }
  );
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: InsertBicycle) => {
      try {
        setIsUploading(true);
        toast({
          title: "Uploading...",
          description: "Submitting your bicycle listing...",
        });

        const formData = new FormData();

        const booleanFields = ["hasReceipt", "isPremium"];
        const numberFields = ["purchaseYear", "price"];

        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => formData.append(key, v));
          } else if (booleanFields.includes(key)) {
            formData.append(key, String(value === true));
          } else if (numberFields.includes(key)) {
            formData.append(key, String(Number(value)));
          } else {
            formData.append(key, value?.toString() ?? "");
          }
        });

        imageFiles.forEach((file) => {
          formData.append("images", file);
        });

        const res = await fetch("/api/hey", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Failed to create listing");
        }

        return res.json();
      } catch (err) {
        console.error("Error:", err);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bicycles"] });
      toast({
        title: "Success!",
        description: "Your bicycle has been listed.",
      });
      form.reset();
      setImageFiles([]);
      setPreviewUrls([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validateImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Only image files are allowed",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Image Too Large",
        description: "Max image size is 5MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleImageFiles = (files: File[]) => {
    if (files.length + imageFiles.length > 5) {
      toast({
        title: "Too Many Images",
        description: "Maximum 5 images allowed",
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter(validateImage);
    setImageFiles((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };
  
  return (
    <Form {...form}>
  <form onSubmit={onSubmit} className="space-y-6">

    {/* Category */}
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Adult">Adult</SelectItem>
              <SelectItem value="Kids">Kids</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
    {/* Brand */}
    <FormField
      control={form.control}
      name="brand"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Brand</FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              setShowCustomBrand(value === "Other");
            }}
            defaultValue={field.value || ""}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {BRANDS.map((brand) => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showCustomBrand && (
            <Input
              placeholder="Enter brand name"
              onChange={(e) => field.onChange(e.target.value)}
              className="mt-2"
            />
          )}
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Model */}
    <FormField name="model" control={form.control} render={({ field }) => (
      <FormItem>
        <FormLabel>Model</FormLabel>
        <FormControl>
          <Input {...field} value={field.value || ""} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />

    {/* Purchase Year */}
    <FormField name="purchaseYear" control={form.control} render={({ field }) => (
  <FormItem>
    <FormLabel>Purchase Year</FormLabel>
    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString() || ""}>
      <FormControl>
        <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
      </FormControl>
      <SelectContent>
        {YEARS.map((y) => (
          <SelectItem key={y} value={y}>{y}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <FormMessage />
  </FormItem>
)} />


    {/* Price */}
    <FormField name="price" control={form.control} render={({ field }) => (
  <FormItem>
    <FormLabel>Price (₹)</FormLabel>
    <FormControl>
      <Input
        type="number"
        {...form.register("price", { valueAsNumber: true })}
        value={field.value === null || field.value === undefined ? "" : field.value}
        onChange={(e) => field.onChange(Number(e.target.value))}
      />
    </FormControl>
    <FormMessage />
  </FormItem>
)} />


    {/* Gear Transmission */}
    <FormField name="gearTransmission" control={form.control} render={({ field }) => (
      <FormItem>
        <FormLabel>Gear Transmission</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
          <FormControl>
            <SelectTrigger><SelectValue placeholder="Select gear transmission" /></SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="Non-Geared">Non-Geared</SelectItem>
            <SelectItem value="Multi-Speed">Multi-Speed</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )} />

    {/* Frame Material */}
    <FormField name="frameMaterial" control={form.control} render={({ field }) => (
      <FormItem>
        <FormLabel>Frame Material</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
          <FormControl>
            <SelectTrigger><SelectValue placeholder="Select frame material" /></SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="Steel">Steel</SelectItem>
            <SelectItem value="Aluminum">Aluminum</SelectItem>
            <SelectItem value="Carbon Fiber">Carbon Fiber</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )} />

    {/* Suspension */}
    <FormField name="suspension" control={form.control} render={({ field }) => (
      <FormItem>
        <FormLabel>Suspension</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
          <FormControl>
            <SelectTrigger><SelectValue placeholder="Select suspension type" /></SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="None">None</SelectItem>
            <SelectItem value="Front">Front</SelectItem>
            <SelectItem value="Full">Full</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )} />

    {/* Condition */}
    <FormField name="condition" control={form.control} render={({ field }) => (
      <FormItem>
        <FormLabel>Condition</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
          <FormControl>
            <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="Fair">Fair</SelectItem>
            <SelectItem value="Good">Good</SelectItem>
            <SelectItem value="Like New">Like New</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )} />

    {/* Cycle Type */}
    <FormField name="cycleType" control={form.control} render={({ field }) => (
      <FormItem>
        <FormLabel>Cycle Type</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
          <FormControl>
            <SelectTrigger><SelectValue placeholder="Select cycle type" /></SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="Mountain">Mountain</SelectItem>
            <SelectItem value="Road">Road</SelectItem>
            <SelectItem value="Hybrid">Hybrid</SelectItem>
            <SelectItem value="BMX">BMX</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )} />

    {/* Wheel Size */}
    <FormField name="wheelSize" control={form.control} render={({ field }) => (
      <FormItem>
        <FormLabel>Wheel Size</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
          <FormControl>
            <SelectTrigger><SelectValue placeholder="Select wheel size" /></SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="12">12"</SelectItem>
            <SelectItem value="16">16"</SelectItem>
            <SelectItem value="20">20"</SelectItem>
            <SelectItem value="24">24"</SelectItem>
            <SelectItem value="26">26"</SelectItem>
            <SelectItem value="27.5">27.5"</SelectItem>
            <SelectItem value="29">29"</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )} />

    {/* Additional Details */}
    <FormField name="additionalDetails" control={form.control} render={({ field }) => (
      <FormItem>
        <FormLabel>Additional Details</FormLabel>
        <FormControl>
          <Textarea {...field} value={field.value || ""} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />

    {/* Status */}
    <FormField name="status" control={form.control} render={({ field }) => (
      <FormItem>
        <FormLabel>Status</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
          <FormControl>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )} />

    {/* Image Upload Section */}
    <div className="space-y-4">
      <FormLabel>Images (max 5)</FormLabel>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isUploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary"
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!isUploading) {
            const files = Array.from(e.dataTransfer.files);
            handleImageFiles(files);
          }
        }}
        onClick={() => {
          if (!isUploading) {
            document.getElementById("image-input")?.click();
          }
        }}
      >
        <input
          id="image-input"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={isUploading}
          onChange={(e) => {
            if (e.target.files) {
              handleImageFiles(Array.from(e.target.files));
            }
          }}
        />
        <p>{isUploading ? "Uploading..." : "Click or drag images to upload"}</p>
      </div>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {previewUrls.map((url, idx) => (
            <div key={idx} className="relative">
              <img src={url} alt={`preview-${idx}`} className="rounded-lg w-full h-32 object-cover" />
              <button
                type="button"
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                onClick={() => {
                  if (!isUploading) {
                    setImageFiles(prev => prev.filter((_, i) => i !== idx));
                    setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
                  }
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>

    <Button
      type="submit"
      disabled={isPending || isUploading}
      className="w-full mt-4"
    >
      Submit Listing
    </Button>
  </form>
</Form>
  );
}
