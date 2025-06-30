import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="pb-24">
        {/* Header Section */}
        <div className="relative h-48 w-full">
            <Image
                src="https://placehold.co/800x300.png"
                alt="Profile banner"
                data-ai-hint="abstract background"
                fill
                className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute top-14 right-4 sm:top-4">
                <Button variant="ghost" size="icon" className="bg-black/20 hover:bg-black/40">
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
            </div>
            <h1 className="absolute top-16 left-4 text-2xl font-bold text-white sm:top-6">Profile</h1>
        </div>

        {/* Profile Info Section */}
        <div className="relative z-10 -mt-16 flex flex-col items-center text-center px-4">
            <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-background">
                    <AvatarImage src="https://placehold.co/112x112.png" alt="Mapple" data-ai-hint="fantasy character" />
                    <AvatarFallback>M</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-1 right-1 h-5 w-5 bg-teal-400 rounded-full border-2 border-background" />
            </div>
            <h2 className="mt-3 text-3xl font-bold">Mapple</h2>
            <p className="text-muted-foreground">Player</p>
        </div>
        
        {/* Tabs Navigation */}
        <div className="px-4 mt-6">
             <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 h-auto rounded-lg">
                    <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">Information</TabsTrigger>
                    <TabsTrigger value="team" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">Team</TabsTrigger>
                    <TabsTrigger value="success" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">Achievements</TabsTrigger>
                </TabsList>
                <TabsContent value="info">
                    <Card><CardContent><p className="text-center text-muted-foreground p-8">Information not available.</p></CardContent></Card>
                </TabsContent>
                 <TabsContent value="team">
                    <Card><CardContent><p className="text-center text-muted-foreground p-8">Team details not available.</p></CardContent></Card>
                </TabsContent>
                 <TabsContent value="success">
                    <Card><CardContent><p className="text-center text-muted-foreground p-8">Achievements not available.</p></CardContent></Card>
                </TabsContent>
            </Tabs>
        </div>
    </div>
  );
}
