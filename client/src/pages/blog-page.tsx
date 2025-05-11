import { useQuery } from "@tanstack/react-query";
import { BlogPost } from "@shared/schema";
import { Helmet } from "react-helmet";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { BlogCard } from "@/components/blog-card";
import { BlogSidebar } from "@/components/blog-sidebar";
import { useState } from "react";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
  });

  return (
    <>
      <Helmet>
        <title>Blog - Pling! | Bicycle Marketplace</title>
        <meta
          name="description"
          content="Discover expert insights about bicycles, maintenance tips, cycling events, and industry news. Read our latest articles about everything cycling."
        />
        <meta 
          name="keywords" 
          content="bicycle blog, cycling tips, bike maintenance, cycling events, bicycle industry news"
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <BlogSidebar />
          </aside>

          {/* Blog Grid */}
          <main className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[400px] rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts?.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
