import type { UserTeam, PlayerProfile, TeamMember, AppNotification } from '@/types';
import { mockUsers, mockTeams } from './mock-data';
import { createNotification } from './notifications-service';

let teams = [...mockTeams];

export const getTeamStream = (teamId: string, callback: (team: UserTeam | null) => void) => {
  const team = teams.find(t => t.id === teamId) || null;
  callback(team);
  return () => {};
}

export const createTeam = async (leaderProfile: PlayerProfile, teamName: string) => {
    if (!leaderProfile) return { success: false, error: "User profile not found." };
    if (leaderProfile.teamId) return { success: false, error: "User is already in a team." };

    const newTeam: UserTeam = {
        id: `team_${Date.now()}`,
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
    teams.push(newTeam);
    
    const user = mockUsers.find(u => u.id === leaderProfile.id);
    if (user) {
        user.teamId = newTeam.id;
    }

    return { success: true, teamId: newTeam.id };
}

export const sendTeamInvite = async (inviterProfile: PlayerProfile, inviteeProfile: PlayerProfile, team: UserTeam) => {
    if (team.members.length >= 5) return { success: false, error: "The team is already full (max 5 members)." };
    if (team.members.some(m => m.uid === inviteeProfile.id)) return { success: false, error: `${inviteeProfile.name} is already in the team.` };
    if (inviteeProfile.teamId) return { success: false, error: `${inviteeProfile.name} is already in another team.` };

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

    return createNotification(notification);
}

export const respondToInvite = async (notificationId: string, acceptingUserProfile: PlayerProfile, teamId: string, response: 'accepted' | 'rejected', fromUid: string) => {
    if (response === 'accepted') {
        const team = teams.find(t => t.id === teamId);
        if (!team) return { success: false, error: "Team no longer exists." };
        if (team.members.length >= 5) return { success: false, error: "The team is now full." };
        
        const newMember: TeamMember = {
            uid: acceptingUserProfile.id,
            name: acceptingUserProfile.name,
            gamerId: acceptingUserProfile.gamerId,
            avatar: acceptingUserProfile.avatar,
            role: 'Member'
        };
        team.members.push(newMember);
        team.memberGamerIds.push(acceptingUserProfile.gamerId);
        
        const user = mockUsers.find(u => u.id === acceptingUserProfile.id);
        if(user) user.teamId = teamId;
    }
    
    await createNotification({
        userId: fromUid,
        type: 'invite_response',
        title: `Invite ${response}`,
        description: `${acceptingUserProfile.name} has ${response} your invitation.`,
        link: '/profile',
        response: response
    });
    
    return { success: true };
}

export const addMemberManually = async (teamId: string, memberGamerId: string, memberName: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return { success: false, error: "Team not found." };
    if (team.members.length >= 5) return { success: false, error: "Team is already full." };
    if (team.memberGamerIds.includes(memberGamerId)) return { success: false, error: "Player with this Gamer ID is already in the team." };
    
    const newMember: TeamMember = {
        name: memberName,
        gamerId: memberGamerId,
        role: 'Member'
    };
    team.members.push(newMember);
    team.memberGamerIds.push(memberGamerId);

    return { success: true };
}

export const leaveTeam = async (userId: string, teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    const user = mockUsers.find(u => u.id === userId);

    if (!team || !user) return { success: false, error: "Could not find team or user." };
    
    if (team.leaderId === userId && team.members.length > 1) {
        return { success: false, error: "Leader must transfer leadership before leaving." };
    }

    team.members = team.members.filter(m => m.uid !== userId);
    team.memberGamerIds = team.memberGamerIds.filter(id => id !== user.gamerId);
    user.teamId = '';

    if (team.members.length === 0) {
        teams = teams.filter(t => t.id !== teamId);
    }

    return { success: true };
}

export const findTeamByGamerIdPlaceholder = async (gamerId: string): Promise<{teamId: string, teamDoc: UserTeam} | null> => {
    return null; // This logic is too complex for a simple mock
}
