"use client";

import { useAuth } from "@/hooks/data/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export function AuthExample() {
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
    needsPasswordCreation,
    loginWithGoogle,
    loginWithFacebook,
  } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Demo</CardTitle>
          <CardDescription>
            Try out different authentication methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/auth/login">
            <Button className="w-full">Login with Email</Button>
          </Link>

          <Link href="/auth/register">
            <Button variant="outline" className="w-full">
              Register
            </Button>
          </Link>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Or continue with:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={loginWithGoogle}>
                Google
              </Button>
              <Button variant="outline" onClick={loginWithFacebook}>
                Facebook
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome, {user?.name || user?.userName}</CardTitle>
        <CardDescription>You are successfully authenticated</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm space-y-1">
          <p>
            <strong>User Name:</strong> {user?.userName}
          </p>
          <p>
            <strong>Name:</strong> {user?.name || "Not provided"}
          </p>
          <p>
            <strong>Provider:</strong> {user?.provider || "local"}
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          {needsPasswordCreation() && (
            <Link href="/auth/create-password">
              <Button variant="outline" className="w-full">
                Create Password
              </Button>
            </Link>
          )}

          {!needsPasswordCreation() && (
            <Link href="/auth/change-password">
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </Link>
          )}

          <Button variant="destructive" className="w-full" onClick={logout}>
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
