import { useQuery } from "@tanstack/react-query";
import { BlogCategory, BlogTag } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export function BlogSidebar() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: categories } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog-categories"],
  });

  const { data: tags } = useQuery<BlogTag[]>({
    queryKey: ["/api/blog-tags"],
  });

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  return (
    <div className="space-y-8">
      {/* Categories Section */}
      <div>
        <h3 className="font-semibold mb-4">Categories</h3>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {categories?.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  selectedCategory === category.id && "bg-primary/10"
                )}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Tags Section */}
      <div>
        <h3 className="font-semibold mb-4">Tags</h3>
        <ScrollArea className="h-[200px]">
          <div className="flex flex-wrap gap-2">
            {tags?.map((tag) => (
              <Button
                key={tag.id}
                variant="outline"
                size="sm"
                className={cn(
                  selectedTags.includes(tag.name) && "bg-primary text-primary-foreground"
                )}
                onClick={() => toggleTag(tag.name)}
              >
                {tag.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
