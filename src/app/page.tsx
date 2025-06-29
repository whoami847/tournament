import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Swords, Gamepad2, User } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Esports HQ
        </h1>
        <p className="text-muted-foreground mt-2 text-lg md:text-xl">Your central hub for competitive gaming.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                    <Swords className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle>Featured Tournaments</CardTitle>
                    <CardDescription>Jump into the biggest events.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full">
                    <Link href="/tournaments">Explore Now</Link>
                </Button>
            </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                    <Gamepad2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle>Create Your Own</CardTitle>
                    <CardDescription>Host your own tournament.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full">
                    <Link href="/create-tournament">Get Started</Link>
                </Button>
            </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                    <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>Manage your teams and stats.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                 <Button asChild className="w-full">
                    <Link href="/profile">View Profile</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
