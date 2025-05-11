import { Link } from "wouter";
import { BlogPost } from "@shared/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Clock, Calendar, User } from "lucide-react";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
        {/* Featured Image with Category Tag */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
          {post.tags[0] && (
            <Badge
              className="absolute top-4 left-4 z-10"
              variant="secondary"
            >
              {post.tags[0]}
            </Badge>
          )}
        </div>

        <CardContent className="p-6">
          {/* Title */}
          <h2 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {post.excerpt}
          </p>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{post.readTime} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(post.createdAt || Date.now()), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>Author</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 border-t">
          <div className="flex gap-2">
            {post.tags.slice(1).map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
