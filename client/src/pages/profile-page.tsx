import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bicycle } from "@shared/schema";
import { Loader2 } from "lucide-react";
import Navbar from "../components/navbar";
import { useToast } from "@/hooks/use-toast";
import BicycleGrid from "@/components/bicycle-grid"
import { UserVerificationForm } from "./user-verification";

const ProfilePage = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null); // Store user data
  const [bicycles, setBicycles] = useState<Bicycle[]>([]);

  type AadhaarStatusResponse = {
    status: string;
    message: string;
  };
  const {
    data: aadhaarData,
    isLoading: aadhaarLoading,
    error: aadhaarError,
  } = useQuery<AadhaarStatusResponse, Error>({
    queryKey: ["aadhaar-status"],
    queryFn: async () => {
      const res = await fetch("/api/aadhaar-verification-status");
      if (!res.ok) throw new Error("Failed to fetch Aadhaar verification status");
      return res.json();
    },
  });

  // Fetch user data from /api/user endpoint
  const { data: userData, isLoading: userLoading, error: userError } = useQuery<any, Error>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      if (!res.ok) {
        throw new Error("Failed to fetch user data.");
      }
      return res.json();
    },
  });

  // Fetch bicycles data for the user
  const { data, isLoading, error } = useQuery<Bicycle[], Error>({
    queryKey: ["user-listed-bicycles"],
    queryFn: async () => {
      const res = await fetch("/api/userlisted/bicycle");
      if (!res.ok) {
        throw new Error("Failed to fetch listed bicycles.");
      }
      return res.json();
    },
  });

  // Handle success and error states for user and bicycles
  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    if (data) {
      setBicycles(data);
    }
    if (userError) {
      toast({
        title: "Error",
        description: userError.message,
        variant: "destructive",
      });
    }
  }, [userData, data, error, userError, toast]);

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Loader2 className="animate-spin h-24 w-24 text-primary mx-auto" />
          
        </div>
      </div>
    );
  }

  if (userError || error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-muted-foreground">{userError?.message || error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Profile Section */}
          <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome to Your Profile</h1>

            {/* User Info */}
            {user && (
              <div className="mt-4 space-y-4">
                <div className="flex justify-center">
                  <img
                    className="w-24 h-24 rounded-full object-cover"
                    src={user.profileImage || "/assets/bicycles/41ONa5HOwfL.jpg"}
                    alt={user.username}
                  />
                </div>
                <div>
                  <p className="text-lg text-muted-foreground">
                    <strong>Username:</strong> {user.username}
                  </p>
                  <p className="text-lg text-muted-foreground">
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p className="text-lg text-muted-foreground">
                    <strong>Name:</strong> {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Aadhaar Verification Status
          <div className="bg-card border rounded-xl p-4 text-center shadow">
            <h2 className="text-xl font-semibold mb-2">Aadhaar Verification Status</h2>
            {aadhaarLoading ? (
              <p className="text-muted-foreground">Loading status...</p>
            ) : aadhaarError ? (
              <p className="text-red-500">Error: {aadhaarError.message}</p>
            ) : (
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${aadhaarData?.status === "verified"
                  ? "bg-green-100 text-green-700"
                  : aadhaarData?.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                  }`}
              >
                {aadhaarData?.status.toUpperCase()}
              </span>
            )}
          </div> */}
          {/* Aadhaar Verification Section */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Aadhaar Verification</h2>
            <UserVerificationForm />
          </section>

          {/* Bicycles Section */}
          <div>
            <h2 className="text-2xl font-bold text-center mt-8">Your Listed Bicycles</h2>
            {bicycles.length === 0 ? (
              <p className="text-center text-muted-foreground">No bicycles listed yet.</p>
            ) : (
              <BicycleGrid bicycles={bicycles} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
