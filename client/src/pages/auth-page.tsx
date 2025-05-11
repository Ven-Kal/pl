"use client";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiGoogle } from "react-icons/si";
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
import { toast } from "sonner";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const {
    user,
    loginMutation,
    registerMutation,
    googleSignInMutation,
    // Make sure this exists in your AuthContextType
    // If it doesn't, you'll need to add it to your context
  } = useAuth();
  const [otpSent, setOtpSent] = useState(false);
  const [registrationData, setRegistrationData] = useState<InsertUser | null>(null);
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");

  const loginForm = useForm<Pick<InsertUser, "username" | "password">>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      mobile: "",
      city: "",
      subCity: "",
      cyclingProficiency: "",
      password: "",
      confirmPassword: "",
      type: "user",
    },
  });

  const otpForm = useForm({
    resolver: zodResolver(
      z.object({
        otp: z.string().min(4, "OTP is required"),
      })
    ),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (user) {
      setLocation("/");
    }

    // Handle Google OAuth redirect with callback
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      // Since handleGoogleCallback doesn't exist on AuthContextType,
      // we're handling it directly here
      handleGoogleCallbackFn(token);
    }
  }, [user, setLocation]);

  // Create a local function to handle Google callback
  const handleGoogleCallbackFn = async (token: string) => {
    try {
      const response = await fetch("/api/auth/google-callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
      
      if (!response.ok) {
        toast("Google login failed");
        return;
      }
      
      // Handle successful login
      setLocation("/");
    } catch (error) {
      console.error("Google callback error:", error);
      toast("Failed to authenticate with Google");
    }
  };

  const onLogin = (data: Pick<InsertUser, "username" | "password">) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = async (data: InsertUser) => {
    setRegistrationData(data);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, isVerifyingOtp: false }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast(result.message || "Failed to send OTP", {
          description: "Please try again later"
        });
        return;
      }

      toast(result.message || "OTP sent to your email", {
        description: "Please check your inbox"
      });

      setOtpSent(true);
    } catch (err) {
      console.error(err);
      toast("Something went wrong", {
        description: "Please try again later"
      });
    }
  };

  const onOtpSubmit = async (otpData: { otp: string }) => {
    if (!registrationData) {
      toast("Registration data not found", {
        description: "Please try registering again"
      });
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...registrationData,
          isVerifyingOtp: true,
          otp: otpData.otp,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast(result.message || "OTP verification failed", {
          description: "Please check and try again"
        });
        return;
      }

      toast("Registration complete. You can now log in.", {
        description: "Welcome to Pling!"
      });

      setOtpSent(false);
      setRegistrationData(null);
      navigate("/auth");
    } catch (err) {
      console.error(err);
      toast("OTP verification failed", {
        description: "Please try again"
      });
    }
  };

  const resetRegistration = () => {
    setOtpSent(false);
    setRegistrationData(null);
    otpForm.reset();
    // setLocation("/")
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-6">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    Login
                  </Button>
                </form>
              </Form>

              <div className="mt-6">
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      or continue with
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => googleSignInMutation.mutate()}
                  disabled={googleSignInMutation.isPending}
                >
                  <SiGoogle className="mr-2 h-4 w-4" />
                  Google
                </Button>
              </div>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              {otpSent ? (
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OTP</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter OTP sent to your email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" className="flex-1" onClick={resetRegistration}>
                        Back
                      </Button>
                      <Button type="submit" className="flex-1">
                        Verify & Register
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                       <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Default is your email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="subCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sub-city</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="cyclingProficiency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cycling Proficiency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="occasional">Occasional</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Request OTP
                    </Button>
                  </form>
                </Form>
              )}
              {!otpSent && (
                <div className="mt-6">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        or sign up with
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => googleSignInMutation.mutate()}
                    disabled={googleSignInMutation.isPending}
                  >
                    <SiGoogle className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Right Side: Hero */}
      <div className="hidden md:flex bg-primary text-white flex-col justify-center p-12">
        <h1 className="text-4xl font-bold mb-6">Welcome to Pling!</h1>
        <p className="text-lg">
          Join the cycling revolution. Login or register to start your journey.
        </p>
      </div>
    </div>
  );
}
