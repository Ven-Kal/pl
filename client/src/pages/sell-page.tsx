import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import BicycleForm from "@/components/bicycle-form";

export default function SellPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">List Your Bicycle</h1>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <BicycleForm />
          </div>
        </div>
      </main>
    </div>
  );
}
