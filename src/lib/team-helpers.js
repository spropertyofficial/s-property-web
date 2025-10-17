// src/lib/team-and-user-helpers.js (atau auth-helpers.js)
import Team from "./models/Team";
import User from "./models/User";

export async function getUserConversationalScope(userId) {
  const agentIdsInScope = [userId.toString()]; // Default: user hanya bisa melihat percakapannya sendiri

  // Cek apakah user ini adalah leader dari tim manapun
  const teamLedByUser = await Team.findOne({ leader: userId }).lean();

  if (teamLedByUser) {
    // Jika dia adalah leader, tambahkan semua anggota timnya ke scope
    teamLedByUser.members.forEach(memberId => {
      agentIdsInScope.push(memberId.toString());
    });
    console.log(`User ${userId} (Leader dari tim ${teamLedByUser.name}) scope: ${agentIdsInScope.join(', ')}`);
  } else {
    console.log(`User ${userId} (Agent) scope: ${agentIdsInScope.join(', ')}`);
  }

  // Hapus duplikasi jika leader juga terdaftar sebagai member
  return [...new Set(agentIdsInScope)];
}