'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { useAuth } from '@/hooks/use-auth';
import { getUserProfileStream, updateUserProfile } from '@/lib/users-service';
import type { PlayerProfile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EditProfileForm, type EditProfileFormValues } from '@/components/profile/edit-profile-form';

export default function EditProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = getUserProfileStream(user.uid, (data) => {
        setProfile(data);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleProfileUpdate = async (data: EditProfileFormValues) => {
    if (!user?.uid) return;
    setIsSubmitting(true);
    const result = await updateUserProfile(user.uid, data);
    if (result.success) {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
      router.push('/profile');
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update profile.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  if (!profile) {
    return (
      <div className="pb-24 animate-pulse">
        <div className="relative h-48 w-full bg-muted"></div>
        <div className="relative z-10 -mt-16 flex flex-col items-center text-center px-4">
            <Skeleton className="h-28 w-28 rounded-full border-4 border-background" />
        </div>
        <div className="p-4 mt-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <Skeleton className="h-12 w-32" />
                </CardContent>
            </Card>
        </div>
      </div>
    );
  }
  
  const displayName = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'Player';

  return (
    <div className="pb-24">
      {/* Header Section */}
      <div className="relative h-48 w-full">
        <Image
          src={profile.banner || "https://placehold.co/800x300.png"}
          alt="Profile banner"
          data-ai-hint="abstract background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute top-4 left-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
        </div>
        <h1 className="absolute top-16 left-4 text-2xl font-bold text-white sm:top-6">Edit Profile</h1>
      </div>

      {/* Profile Info Section */}
      <div className="relative z-10 -mt-16 flex flex-col items-center text-center px-4">
        <Avatar className="h-28 w-28 border-4 border-background">
          <AvatarImage src={profile.avatar || ''} alt="Avatar" data-ai-hint="fantasy character" />
          <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>

      <div className="px-4 mt-6">
        <Card>
            <CardHeader>
                <CardTitle>Update Information</CardTitle>
                <CardDescription>Change your details below. Click save when you're done.</CardDescription>
            </CardHeader>
            <CardContent>
                <EditProfileForm
                    profile={profile}
                    onSubmit={handleProfileUpdate}
                    isSubmitting={isSubmitting}
                    onClose={() => router.back()}
                />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
