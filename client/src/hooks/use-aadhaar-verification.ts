// hooks/use-aadhaar-verification.ts
import { useQuery } from "@tanstack/react-query";

export function useAadhaarVerification() {
  return useQuery({
    queryKey: ["aadhaar-verification-status"],
    queryFn: async () => {
      const res = await fetch("/api/aadhaar-verification-status", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Not verified");
      return res.json(); // expected { status: "verified" | "pending" | ... }
    },
    retry: false,
  });
}
