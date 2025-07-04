
import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  updateDoc,
  writeBatch,
  arrayUnion,
  arrayRemove,
  query,
  where,
  getDocs,
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
    memberGamerIds: data.memberGamerIds || [],
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
        }],
        memberGamerIds: [leaderProfile.gamerId],
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
    if (team.members.length >= 5) {
        return { success: false, error: "The team is already full (max 5 members)." };
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
        const teamSnap = await getDoc(teamRef);
        if (!teamSnap.exists()) {
             return { success: false, error: "Team no longer exists." };
        }
        const teamData = teamSnap.data() as UserTeam;
        if (teamData.members.length >= 5) {
            return { success: false, error: "The team is now full." };
        }
        
        const newMember: TeamMember = {
            uid: acceptingUserProfile.id,
            name: acceptingUserProfile.name,
            gamerId: acceptingUserProfile.gamerId,
            avatar: acceptingUserProfile.avatar,
            role: 'Member'
        };
        batch.update(teamRef, { 
            members: arrayUnion(newMember),
            memberGamerIds: arrayUnion(acceptingUserProfile.gamerId)
        });
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
    const teamRef = doc(firestore, 'teams', teamId);
    const batch = writeBatch(firestore);

    try {
        const teamSnap = await getDoc(teamRef);
        if (!teamSnap.exists()) return { success: false, error: "Team not found." };
        
        const team = teamSnap.data() as UserTeam;
        if (team.members.length >= 5) {
            return { success: false, error: "Team is already full (max 5 members)." };
        }
        if (team.memberGamerIds.includes(memberGamerId)) {
            return { success: false, error: "A player with this Gamer ID is already in the team." };
        }
        
        const newMember: TeamMember = {
            name: memberName,
            gamerId: memberGamerId,
            role: 'Member'
            // uid and avatar are intentionally omitted for placeholders
        };
        batch.update(teamRef, { 
            members: arrayUnion(newMember),
            memberGamerIds: arrayUnion(memberGamerId)
        });

        await batch.commit();
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export const leaveTeam = async (userId: string, teamId: string) => {
    const batch = writeBatch(firestore);
    const teamRef = doc(firestore, 'teams', teamId);
    const userRef = doc(firestore, 'users', userId);

    try {
        const teamSnap = await getDoc(teamRef);
        const userSnap = await getDoc(userRef);

        if (!teamSnap.exists() || !userSnap.exists()) {
            return { success: false, error: "Could not find team or user." };
        }

        const team = teamSnap.data() as UserTeam;
        const user = userSnap.data() as PlayerProfile;
        
        const memberToRemove = team.members.find(m => m.uid === userId);
        if (!memberToRemove) {
            return { success: false, error: "You are not a member of this team." };
        }

        if (team.leaderId === userId) {
            if (team.members.length > 1) {
                return { success: false, error: "Leader cannot leave. Please transfer leadership first." };
            } else {
                // Last member is the leader, so delete the team
                batch.delete(teamRef);
            }
        } else {
            // Member is leaving
            batch.update(teamRef, { 
                members: arrayRemove(memberToRemove),
                memberGamerIds: arrayRemove(user.gamerId)
            });
        }
        
        // Remove teamId from user profile
        batch.update(userRef, { teamId: '' });
        
        await batch.commit();
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export const findTeamByGamerIdPlaceholder = async (gamerId: string): Promise<{teamId: string, teamDoc: UserTeam} | null> => {
    const teamsRef = collection(firestore, 'teams');
    const q = query(teamsRef, where('memberGamerIds', 'array-contains', gamerId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const teamDoc = querySnapshot.docs[0];
    const teamData = teamFromFirestore(teamDoc);

    // Ensure it's a placeholder (no UID)
    const placeholderMember = teamData.members.find(m => m.gamerId === gamerId && !m.uid);
    if (placeholderMember) {
        return { teamId: teamDoc.id, teamDoc: teamData };
    }
    
    return null;
}
