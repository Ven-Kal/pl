import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Navigate } from "react-router-dom";

const verificationSchema = z.object({
  aadhaarNumber: z
    .string()
    .min(12, "Must be 12 digits")
    .max(12, "Must be 12 digits")
    .regex(/^\d+$/, "Only digits allowed"),
  aadhaarFrontFile: z.instanceof(File, { message: "Front image required" }),
  aadhaarBackFile: z.instanceof(File, { message: "Back image required" }),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

export function UserVerificationForm() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [frontPreview, setFrontPreview] = useState("");
  const [backPreview, setBackPreview] = useState("");
  const [status, setStatus] = useState<"pending" | "verified" | "none">("none");

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      aadhaarNumber: "",
      aadhaarFrontFile: undefined as unknown as File,
      aadhaarBackFile: undefined as unknown as File,
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: VerificationFormData) => {
      const formData = new FormData();
      formData.append("aadhaarNumber", data.aadhaarNumber);
      formData.append("aadhaarFront", data.aadhaarFrontFile);
      formData.append("aadhaarBack", data.aadhaarBackFile);

      const res = await fetch("/api/verify-aadhaar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Submission failed");
      }

      return res.json();
    },
    onSuccess: () => {
      setStatus("pending");
      toast({
        title: "Submitted",
        description: "Verification submitted and is under review.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/aadhaar-verification-status");
        if (!res.ok) {
          setStatus("none");
          return;
        }
        const data = await res.json();
        setStatus(data.status === "verified" ? "verified" : "pending");
      } catch (err) {
        console.error("Failed to fetch Aadhaar status", err);
        setStatus("none");
      }
    }

    fetchStatus();
  }, []);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (side === "front") {
      setFrontPreview(previewUrl);
      form.setValue("aadhaarFrontFile", file);
    } else {
      setBackPreview(previewUrl);
      form.setValue("aadhaarBackFile", file);
    }
  };

  const onSubmit = (data: VerificationFormData) => {
    verifyMutation.mutate(data);
  };

  if (!user) return <Navigate to="/login" replace />;

  if (status === "verified") {
    return (
      <div className="p-6 bg-green-50 rounded-lg">
        <div className="flex items-center gap-2 text-green-600">
          <Check className="w-5 h-5" />
          <span>Your identity is verified.</span>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg">
        <p className="text-yellow-700">
          Your Aadhaar verification is under review.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="aadhaarNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aadhaar Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter 12-digit Aadhaar number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="aadhaarFrontFile"
            render={() => (
              <FormItem>
                <FormLabel>Front Image</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "front")}
                />
                {frontPreview && (
                  <img
                    src={frontPreview}
                    alt="Aadhaar Front"
                    className="mt-2 rounded-md border shadow"
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="aadhaarBackFile"
            render={() => (
              <FormItem>
                <FormLabel>Back Image</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "back")}
                />
                {backPreview && (
                  <img
                    src={backPreview}
                    alt="Aadhaar Back"
                    className="mt-2 rounded-md border shadow"
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={verifyMutation.isPending}>
          {verifyMutation.isPending ? "Submitting..." : "Submit for Verification"}
        </Button>
      </form>
    </Form>
  );
}
