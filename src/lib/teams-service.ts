import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  updateDoc,
  writeBatch,
  arrayUnion,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { UserTeam, PlayerProfile, TeamMember, AppNotification } from '@/types';
import { findUserByGamerId } from './users-service';
import { createNotification } from './notifications-service';

// fromFirestore helper
const teamFromFirestore = (doc: any): UserTeam => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    avatar: data.avatar,
    dataAiHint: data.dataAiHint,
    leaderId: data.leaderId,
    members: data.members || [],
  }
}

// getTeamStream
export const getTeamStream = (teamId: string, callback: (team: UserTeam | null) => void) => {
  const teamRef = doc(firestore, 'teams', teamId);
  const unsubscribe = onSnapshot(teamRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(teamFromFirestore(docSnap));
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Error fetching team stream:", error);
    callback(null);
  });
  return unsubscribe;
}

// createTeam
export const createTeam = async (leaderProfile: PlayerProfile, teamName: string) => {
    if (!leaderProfile) return { success: false, error: "User profile not found." };
    if (leaderProfile.teamId) return { success: false, error: "User is already in a team." };

    const batch = writeBatch(firestore);
    const teamRef = doc(collection(firestore, 'teams'));

    const newTeam: UserTeam = {
        id: teamRef.id,
        name: teamName,
        leaderId: leaderProfile.id,
        avatar: leaderProfile.avatar || "https://placehold.co/96x96.png",
        dataAiHint: "team logo",
        members: [{
            uid: leaderProfile.id,
            name: leaderProfile.name,
            gamerId: leaderProfile.gamerId,
            avatar: leaderProfile.avatar,
            role: 'Leader'
        }]
    };
    batch.set(teamRef, newTeam);

    const userRef = doc(firestore, 'users', leaderProfile.id);
    batch.update(userRef, { teamId: teamRef.id });

    try {
        await batch.commit();
        return { success: true, teamId: teamRef.id };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// sendInvite
export const sendTeamInvite = async (inviterProfile: PlayerProfile, inviteeProfile: PlayerProfile, team: UserTeam) => {
    if (!inviterProfile || !inviteeProfile || !team) {
        return { success: false, error: "Missing required information." };
    }
    if (team.members.some(m => m.uid === inviteeProfile.id)) {
        return { success: false, error: `${inviteeProfile.name} is already in the team.` };
    }
     if (inviteeProfile.teamId) {
        return { success: false, error: `${inviteeProfile.name} is already in another team.` };
    }

    const notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'> = {
        userId: inviteeProfile.id,
        type: 'team_invite',
        title: `Team Invitation`,
        description: `${inviterProfile.name} has invited you to join team "${team.name}".`,
        link: '/profile',
        from: { uid: inviterProfile.id, name: inviterProfile.name },
        team: { id: team.id, name: team.name },
        status: 'pending',
    }

    const result = await createNotification(notification);
    return result;
}

// respondToInvite
export const respondToInvite = async (notificationId: string, acceptingUserProfile: PlayerProfile, teamId: string, response: 'accepted' | 'rejected', fromUid: string) => {
    const batch = writeBatch(firestore);
    const notificationRef = doc(firestore, 'notifications', notificationId);
    batch.update(notificationRef, { status: response, read: true });

    const teamRef = doc(firestore, 'teams', teamId);
    const userRef = doc(firestore, 'users', acceptingUserProfile.id);

    if (response === 'accepted') {
        const newMember: TeamMember = {
            uid: acceptingUserProfile.id,
            name: acceptingUserProfile.name,
            gamerId: acceptingUserProfile.gamerId,
            avatar: acceptingUserProfile.avatar,
            role: 'Member'
        };
        batch.update(teamRef, { members: arrayUnion(newMember) });
        batch.update(userRef, { teamId: teamId });
    }

    // Notify inviter
    const inviterNotification: Omit<AppNotification, 'id' | 'createdAt' | 'read'> = {
        userId: fromUid,
        type: 'invite_response',
        title: `Invite ${response}`,
        description: `${acceptingUserProfile.name} has ${response} your invitation.`,
        link: '/profile',
        response: response
    };
    // This doesn't need to be in the batch, can be a separate call
    const inviterNotificationResult = await createNotification(inviterNotification);
    
    if (!inviterNotificationResult.success) {
      console.error("Failed to create response notification.");
    }

    try {
        await batch.commit();
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// addMemberManually
export const addMemberManually = async (teamId: string, memberGamerId: string, memberName: string) => {
    const inviteeProfile = await findUserByGamerId(memberGamerId);
    if (!inviteeProfile) {
        return { success: false, error: `User with Gamer ID "${memberGamerId}" not found.` };
    }
    if (inviteeProfile.teamId) {
        return { success: false, error: `User "${inviteeProfile.name}" is already in another team.` };
    }

    const batch = writeBatch(firestore);
    const teamRef = doc(firestore, 'teams', teamId);
    const userRef = doc(firestore, 'users', inviteeProfile.id);

    const newMember: TeamMember = {
        uid: inviteeProfile.id,
        name: memberName, // Use the manually entered name
        gamerId: memberGamerId,
        avatar: inviteeProfile.avatar,
        role: 'Member'
    };
    batch.update(teamRef, { members: arrayUnion(newMember) });
    batch.update(userRef, { teamId: teamId });

    try {
        await batch.commit();
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}
