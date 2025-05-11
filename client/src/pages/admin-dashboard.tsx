import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFaqSchema, type InsertFAQ, type FAQ } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  [key: string]: string | number;
}

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("analytics");
  const [analyticsGroupBy, setAnalyticsGroupBy] = useState<
    "device" | "platform" | "browser" | "path"
  >("device");
  const { toast } = useToast();

  // Analytics Query
  const analyticsQuery = useQuery({
    queryKey: ["/api/admin/analytics/visits", analyticsGroupBy] as const,
    queryFn: async () => {
      const response = await apiRequest("/api/admin/analytics/visits", {
        method: "GET",
        params: { groupBy: analyticsGroupBy }
      });
      return response.json() as Promise<AnalyticsData[]>;
    },
  });

  // FAQs Query and Mutations
  const faqsQuery = useQuery({
    queryKey: ["/api/faqs"] as const,
    queryFn: async () => {
      const response = await apiRequest("/api/faqs", {
        method: "GET"
      });
      return response.json() as Promise<FAQ[]>;
    },
  });

  const createFaqMutation = useMutation({
    mutationFn: async (data: InsertFAQ) => {
      const response = await apiRequest("/api/admin/faqs", {
        method: "POST",
        body: data,
      });
      return response.json() as Promise<FAQ>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({
        title: "FAQ Created",
        description: "The FAQ has been created successfully.",
      });
      faqForm.reset();
    },
  });

  const faqForm = useForm<InsertFAQ>({
    resolver: zodResolver(insertFaqSchema),
    defaultValues: {
      question: "",
      answer: "",
      category: "general",
      order: 0,
      isActive: true,
    },
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Visit Analytics</CardTitle>
              <CardDescription>Track user visits and device information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Button
                  variant={analyticsGroupBy === "device" ? "default" : "outline"}
                  onClick={() => setAnalyticsGroupBy("device")}
                >
                  By Device
                </Button>
                <Button
                  variant={analyticsGroupBy === "platform" ? "default" : "outline"}
                  onClick={() => setAnalyticsGroupBy("platform")}
                >
                  By Platform
                </Button>
                <Button
                  variant={analyticsGroupBy === "browser" ? "default" : "outline"}
                  onClick={() => setAnalyticsGroupBy("browser")}
                >
                  By Browser
                </Button>
                <Button
                  variant={analyticsGroupBy === "path" ? "default" : "outline"}
                  onClick={() => setAnalyticsGroupBy("path")}
                >
                  By Path
                </Button>
              </div>

              {analyticsQuery.data && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{analyticsGroupBy}</TableHead>
                      <TableHead>Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsQuery.data.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{String(row[analyticsGroupBy])}</TableCell>
                        <TableCell>{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <CardTitle>FAQ Management</CardTitle>
              <CardDescription>
                Add and manage frequently asked questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...faqForm}>
                <form
                  onSubmit={faqForm.handleSubmit((data) =>
                    createFaqMutation.mutate(data)
                  )}
                  className="space-y-4 mb-8"
                >
                  <FormField
                    control={faqForm.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={faqForm.control}
                    name="answer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Answer</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={faqForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={faqForm.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={createFaqMutation.isPending}>
                    Add FAQ
                  </Button>
                </form>

                {faqsQuery.data && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Order</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faqsQuery.data.map((faq) => (
                        <TableRow key={faq.id}>
                          <TableCell>{faq.question}</TableCell>
                          <TableCell>{faq.category}</TableCell>
                          <TableCell>{faq.order}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}