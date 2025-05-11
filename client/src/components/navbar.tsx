import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserCircle } from "lucide-react";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Main Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <a className="text-2xl font-bold text-primary">Pling!</a>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search bicycles..."
                  className="w-full pl-10"
                />
              </div>
            </div>

            {/* Auth buttons */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/profile">
                    <Button variant="ghost" className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5" />
                      Profile
                    </Button>
                  </Link>
                  {user.isAdmin && (
                    <Link href="/admin">
                      <Button variant="ghost">Admin Dashboard</Button>
                    </Link>
                  )}
                  <Button variant="ghost" onClick={() => logoutMutation.mutate()}>
                    Logout
                  </Button>
                  <Link href="/sell">
                    <Button variant="default">Sell Bicycle</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth">
                    <Button variant="ghost">Login / Register</Button>
                  </Link>
                  <Link href="/sell">
                    <Button variant="default">Sell Bicycle</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Categories Navigation */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-8 h-12">
            <Link href="/blog">
              <a className="text-sm font-medium hover:text-primary">Blog</a>
            </Link>
            <Link href="/premium">
              <a className="text-sm font-medium hover:text-primary">Premium Bicycles</a>
            </Link>
            <Link href="/Adult">
              <a className="text-sm font-medium hover:text-primary">Adult Bicycles</a>
            </Link>
            <Link href="/Kids">
              <a className="text-sm font-medium hover:text-primary">Kids Bicycles</a>
            </Link>
            <Link href="/certified">
              <a className="text-sm font-medium hover:text-primary">Certified Sellers</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}