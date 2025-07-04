
"use client"

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, User, Gamepad2, Mail, Calendar, Users, Shield, Trophy, Star, Flame, LogOut, Pencil, Check, X, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { signOutUser } from '@/lib/auth-service';
import { useRouter } from 'next/navigation';
import { getUserProfileStream, findUserByGamerId } from '@/lib/users-service';
import type { PlayerProfile, UserTeam, AppNotification } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { 
    createTeam, 
    getTeamStream, 
    sendTeamInvite,
    addMemberManually,
    respondToInvite
} from '@/lib/teams-service';
import { getNotificationsStream } from '@/lib/notifications-service';


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

const TeamInfo = ({ profile }: { profile: PlayerProfile }) => {
    const { toast } = useToast();
    const [team, setTeam] = useState<UserTeam | null>(null);
    const [invites, setInvites] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [isCreateTeamOpen, setCreateTeamOpen] = useState(false);
    const [isAddInviteOpen, setAddInviteOpen] = useState(false);
    const [isAddManualOpen, setAddManualOpen] = useState(false);
    
    // Form states
    const [newTeamName, setNewTeamName] = useState('');
    const [inviteGamerId, setInviteGamerId] = useState('');
    const [foundUser, setFoundUser] = useState<PlayerProfile | null>(null);
    const [manualGamerId, setManualGamerId] = useState('');
    const [manualGamerName, setManualGamerName] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!profile.id) return;

        const unsubInvites = getNotificationsStream(profile.id, (notifications) => {
            const pendingInvites = notifications.filter(n => n.type === 'team_invite' && n.status === 'pending');
            setInvites(pendingInvites);
        });

        if (profile.teamId) {
            const unsubTeam = getTeamStream(profile.teamId, (teamData) => {
                setTeam(teamData);
                setLoading(false);
            });
            return () => { unsubTeam(); unsubInvites(); };
        } else {
            setLoading(false);
            setTeam(null);
            return () => unsubInvites();
        }
    }, [profile]);
    
    const handleCreateTeam = async () => {
        if (!newTeamName.trim()) {
            toast({ title: "Error", description: "Please enter a team name.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        const result = await createTeam(profile, newTeamName.trim());
        if (result.success) {
            toast({ title: "Team Created!", description: `Welcome to ${newTeamName.trim()}.` });
            setCreateTeamOpen(false);
            setNewTeamName('');
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
        setIsSubmitting(false);
    }
    
    const handleFindUser = async () => {
        if (!inviteGamerId.trim()) return;
        setIsSubmitting(true);
        setFoundUser(null);
        const userFound = await findUserByGamerId(inviteGamerId.trim());
        setFoundUser(userFound);
        if (!userFound) {
            toast({ title: "Not Found", description: "No user found with that Gamer ID.", variant: "destructive" });
        }
        setIsSubmitting(false);
    }

    const handleSendInvite = async () => {
        if (!foundUser || !team) return;
        setIsSubmitting(true);
        const result = await sendTeamInvite(profile, foundUser, team);
        if (result.success) {
            toast({ title: "Invite Sent!", description: `Invitation sent to ${foundUser.name}.` });
            setAddInviteOpen(false);
            setInviteGamerId('');
            setFoundUser(null);
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
        setIsSubmitting(false);
    }

    const handleAddManually = async () => {
        if (!manualGamerId.trim() || !manualGamerName.trim() || !team) return;
        setIsSubmitting(true);
        const result = await addMemberManually(team.id, manualGamerId.trim(), manualGamerName.trim());
        if (result.success) {
            toast({ title: "Member Added!", description: `${manualGamerName.trim()} has been added to the team.` });
            setAddManualOpen(false);
            setManualGamerId('');
            setManualGamerName('');
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
        setIsSubmitting(false);
    }
    
    const handleInviteResponse = async (notification: AppNotification, response: 'accepted' | 'rejected') => {
        if (!notification.team?.id || !notification.from?.uid) return;
        setIsSubmitting(true);
        const result = await respondToInvite(notification.id, profile, notification.team.id, response, notification.from.uid);
        if (!result.success) {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        } else {
            toast({ title: `Invite ${response}!`, description: `You have ${response} the invitation to join ${notification.team.name}.` });
        }
        setIsSubmitting(false);
    }

    if (loading) {
        return <Card><CardHeader><CardTitle>My Team</CardTitle></CardHeader><CardContent><p>Loading team info...</p></CardContent></Card>
    }

    if (!team) {
        return (
             <Dialog open={isCreateTeamOpen} onOpenChange={setCreateTeamOpen}>
                <Card>
                    <CardHeader>
                        <CardTitle>My Team</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground mb-4">You are not part of any team yet.</p>
                        <DialogTrigger asChild>
                            <Button>Create a Team</Button>
                        </DialogTrigger>
                    </CardContent>
                </Card>
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Your Team</DialogTitle>
                        <DialogDescription>Give your team a name to get started.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="team-name">Team Name</Label>
                            <Input id="team-name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="e.g., Cosmic Knights" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleCreateTeam} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Create Team"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }
    
    return (
    <Card>
        <CardHeader className="flex-row items-center justify-between">
            <CardTitle>My Team</CardTitle>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Team</DialogTitle>
                        <DialogDescription>Add new members to your team.</DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 py-4">
                        {/* Add via Invite Dialog */}
                        <Dialog open={isAddInviteOpen} onOpenChange={setAddInviteOpen}>
                            <DialogTrigger asChild><Button className="flex-1">Add Member using UID</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Invite Member</DialogTitle>
                                    <DialogDescription>Enter a player's Gamer ID to send them a team invite.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="flex gap-2">
                                        <Input value={inviteGamerId} onChange={(e) => setInviteGamerId(e.target.value)} placeholder="Enter Gamer ID" />
                                        <Button onClick={handleFindUser} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin"/> : "Find"}</Button>
                                    </div>
                                    {foundUser && (
                                        <div className="p-3 rounded-md bg-muted flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8"><AvatarImage src={foundUser.avatar} /><AvatarFallback>{foundUser.name.charAt(0)}</AvatarFallback></Avatar>
                                                <div>
                                                    <p className="font-semibold">{foundUser.name}</p>
                                                    <p className="text-xs text-muted-foreground">{foundUser.gamerId}</p>
                                                </div>
                                            </div>
                                            <Button size="sm" onClick={handleSendInvite} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : "Send Invite"}</Button>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                        {/* Add Manually Dialog */}
                        <Dialog open={isAddManualOpen} onOpenChange={setAddManualOpen}>
                             <DialogTrigger asChild><Button variant="secondary" className="flex-1">Add Member manually</Button></DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Member Manually</DialogTitle>
                                    <DialogDescription>Directly add a member to your team. No invitation needed.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <Input value={manualGamerName} onChange={(e) => setManualGamerName(e.target.value)} placeholder="Gamer Name" />
                                    <Input value={manualGamerId} onChange={(e) => setManualGamerId(e.target.value)} placeholder="Gamer ID" />
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setAddManualOpen(false)}>Cancel</Button>
                                    <Button onClick={handleAddManually} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : "Add Member"}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
            {invites.length > 0 && (
                <div className="mb-6 space-y-3">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        Pending Invites
                    </h4>
                    {invites.map(invite => (
                        <div key={invite.id} className="flex items-center justify-between rounded-md bg-muted p-2">
                           <p className="text-sm">Invite from <b>{invite.team?.name}</b></p>
                           <div className="flex gap-2">
                                <Button size="icon" className="h-8 w-8 bg-green-500/20 text-green-500 hover:bg-green-500/30" onClick={() => handleInviteResponse(invite, 'accepted')} disabled={isSubmitting}><Check className="h-4 w-4"/></Button>
                                <Button size="icon" className="h-8 w-8 bg-red-500/20 text-red-500 hover:bg-red-500/30" onClick={() => handleInviteResponse(invite, 'rejected')} disabled={isSubmitting}><X className="h-4 w-4" /></Button>
                           </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={team.avatar} alt={team.name} data-ai-hint={team.dataAiHint} />
                    <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-2xl font-bold">{team.name}</h3>
                    <p className="font-medium text-primary">{team.members.find(m => m.uid === profile.id)?.role}</p>
                </div>
            </div>
            <div className="mt-6">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Team Members
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {team.members.map(member => (
                        <div key={member.uid} className="flex items-center gap-3 rounded-md bg-muted p-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={member.avatar} alt={member.name} />
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

const achievements = [
    { icon: Trophy, title: "Tournament Winner", tournament: "ML Diamond Cup S5", date: "July 2024", color: "text-amber-400" },
    { icon: Star, title: "MVP Award", tournament: "Summer Skirmish", date: "July 2024", color: "text-blue-400" },
    { icon: Flame, title: "Top Fragger", tournament: "CODM Battle Arena", date: "July 2024", color: "text-red-400" },
];

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
    
    if (!profile) {
        // You can return a loader here
        return <div className="flex items-center justify-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }
    
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
                        <TeamInfo profile={profile} />
                    </TabsContent>
                    <TabsContent value="success" className="mt-4">
                        <Achievements />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
