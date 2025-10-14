import Team from '@/lib/models/Team';
import User from '@/lib/models/User';
import Project from '@/lib/models/Project';
import dbConnect from '@/lib/mongodb';

export async function POST(req) {
  await dbConnect();
  try {
    const { name, leader, members, project } = await req.json();
    if (!name || !leader || !project) {
      return Response.json({ success: false, error: 'Nama, leader, dan project wajib diisi' }, { status: 400 });
    }
    // Pastikan leader dan member adalah user yang valid
    const leaderUser = await User.findById(leader);
    if (!leaderUser) return Response.json({ success: false, error: 'Leader tidak ditemukan' }, { status: 404 });
    const memberUsers = members && members.length > 0 ? await User.find({ _id: { $in: members } }) : [];
    // Buat tim
    const team = await Team.create({
      name,
      leader: leaderUser._id,
      members: memberUsers.map(u => u._id),
      project,
    });
    // Tambahkan tim ke project
    await Project.findByIdAndUpdate(project, { $addToSet: { teams: team._id } });
  // Populate untuk response
  const populatedTeam = await Team.findById(team._id).populate('leader').populate('members');
  return Response.json({ success: true, data: populatedTeam });
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();
  try {
    const teams = await Team.find().populate('leader').populate('members').populate('project');
    return Response.json({ success: true, data: teams });
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
