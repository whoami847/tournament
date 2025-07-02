
"use client"

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, User, Gamepad2, Mail, Calendar, Users, Shield, Trophy, Star, Flame, LogOut, Pencil } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { signOutUser } from '@/lib/auth-service';
import { useRouter } from 'next/navigation';
import { getUserProfileStream } from '@/lib/users-service';
import type { PlayerProfile } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"


// --- MOCK DATA (will be replaced by dynamic data) ---
const initialTeamInfo = {
    name: "Cosmic Knights",
    avatar: "https://placehold.co/96x96.png",
    dataAiHint: "knight helmet logo",
    role: "In-Game Leader (IGL)",
    members: [
        { name: "Shadow", avatar: "https://placehold.co/40x40.png", dataAiHint: "male gamer intense" },
        { name: "Vortex", avatar: "https://placehold.co/40x40.png", dataAiHint: "female gamer focused" },
        { name: "Nova", avatar: "https://placehold.co/40x40.png", dataAiHint: "male gamer smiling" },
        { name: "Blaze", avatar: "https://placehold.co/40x40.png", dataAiHint: "female gamer headset" },
    ],
};

const achievements = [
    { icon: Trophy, title: "Tournament Winner", tournament: "ML Diamond Cup S5", date: "July 2024", color: "text-amber-400" },
    { icon: Star, title: "MVP Award", tournament: "Summer Skirmish", date: "July 2024", color: "text-blue-400" },
    { icon: Flame, title: "Top Fragger", tournament: "CODM Battle Arena", date: "July 2024", color: "text-red-400" },
];


// --- SUB-COMPONENTS ---

const InfoItem = ({ icon: Icon, label, value }: { icon: LucideIcon, label: string, value: string }) => (
    <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    </div>
);

const UserInfo = ({ profile }: { profile: PlayerProfile | null }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <InfoItem icon={User} label="Full Name" value={profile?.name || 'N/A'} />
                <InfoItem icon={Mail} label="Email" value={profile?.email || 'N/A'} />
                <InfoItem icon={Gamepad2} label="Game Name" value={profile?.gameName || 'Not Set'} />
                <InfoItem icon={Shield} label="Gamer ID" value={profile?.gamerId || 'N/A'} />
                <InfoItem icon={Calendar} label="Joined" value={profile?.joined ? format(new Date(profile.joined), 'PPP') : 'N/A'} />
            </CardContent>
        </Card>
    );
};

const TeamInfo = () => {
    const { toast } = useToast();
    const [teamInfo, setTeamInfo] = useState(initialTeamInfo);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: teamInfo.name, avatar: teamInfo.avatar });

    const handleSave = () => {
        setTeamInfo(prev => ({...prev, name: editForm.name, avatar: editForm.avatar }));
        setIsEditing(false);
        toast({
            title: "Team Updated",
            description: "Your team information has been updated locally.",
        });
    }
    
    return (
    <Card>
        <CardHeader className="flex-row items-center justify-between">
            <CardTitle>My Team</CardTitle>
             <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Team Information</DialogTitle>
                         <DialogDescription>
                            Update your team's name and avatar. Changes are not saved to the database yet.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="team-name">Team Name</Label>
                            <Input id="team-name" value={editForm.name} onChange={(e) => setEditForm(prev => ({...prev, name: e.target.value}))} />
                        </div>
                         <div className="flex gap-2">
                            <Button>Add member using UID</Button>
                            <Button>Add member manually</Button>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="avatar-url">Avatar URL</Label>
                            <Input id="avatar-url" value={editForm.avatar} onChange={(e) => setEditForm(prev => ({...prev, avatar: e.target.value}))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Close</Button>
                        <Button onClick={handleSave}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={teamInfo.avatar} alt={teamInfo.name} data-ai-hint={teamInfo.dataAiHint} />
                    <AvatarFallback>{teamInfo.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-2xl font-bold">{teamInfo.name}</h3>
                    <p className="font-medium text-primary">{teamInfo.role}</p>
                </div>
            </div>
            <div className="mt-6">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Team Members
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {teamInfo.members.map(member => (
                        <div key={member.name} className="flex items-center gap-3 rounded-md bg-muted p-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{member.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
    </Card>
    );
};

const Achievements = () => (
    <Card>
        <CardHeader>
            <CardTitle>Top Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {achievements.map((ach, index) => (
                <div key={index} className="flex items-center gap-4 rounded-lg bg-muted p-4">
                    <div className="flex h-12 w-12 items-center justify-center">
                        <ach.icon className={`h-8 w-8 ${ach.color}`} />
                    </div>
                    <div>
                        <p className="font-bold">{ach.title}</p>
                        <p className="text-sm text-muted-foreground">{ach.tournament} &bull; {ach.date}</p>
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
);


export default function ProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<PlayerProfile | null>(null);

    useEffect(() => {
        if (user?.uid) {
            const unsubscribe = getUserProfileStream(user.uid, (data) => {
                setProfile(data);
            });
            return () => unsubscribe();
        }
    }, [user]);

    const handleLogout = async () => {
        await signOutUser();
        router.push('/login');
    };
    
    const displayName = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'Player';
    const fallback = displayName.charAt(0).toUpperCase();

    return (
        <div className="pb-24">
            {/* Header Section */}
            <div className="relative h-48 w-full">
                <Image
                    src={profile?.banner || "https://placehold.co/800x300.png"}
                    alt="Profile banner"
                    data-ai-hint="abstract background"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                <div className="absolute top-14 right-4 sm:top-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="bg-black/20 hover:bg-black/40 text-white hover:text-white">
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href="/profile/edit">Edit Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/admin">Admin Panel</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2">
                                <LogOut className="h-4 w-4" />
                                <span>Log Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <h1 className="absolute top-16 left-4 text-2xl font-bold text-white sm:top-6">Profile</h1>
            </div>

            {/* Profile Info Section */}
            <div className="relative z-10 -mt-16 flex flex-col items-center text-center px-4">
                <div className="relative">
                    <Avatar className="h-28 w-28 border-4 border-background">
                        <AvatarImage src={profile?.avatar || user?.photoURL || ''} alt={displayName} data-ai-hint="fantasy character" />
                        <AvatarFallback>{fallback}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-1 right-1 h-5 w-5 bg-teal-400 rounded-full border-2 border-background" />
                </div>
                <h2 className="mt-3 text-3xl font-bold">{displayName}</h2>
                <p className="text-muted-foreground">Player</p>
            </div>
            
            {/* Tabs Navigation */}
            <div className="px-4 mt-6">
                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-card p-1 h-auto rounded-lg border">
                        <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">Information</TabsTrigger>
                        <TabsTrigger value="team" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">Team</TabsTrigger>
                        <TabsTrigger value="success" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">Achievements</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info" className="mt-4">
                        <UserInfo profile={profile} />
                    </TabsContent>
                    <TabsContent value="team" className="mt-4">
                        <TeamInfo />
                    </TabsContent>
                    <TabsContent value="success" className="mt-4">
                        <Achievements />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
