import Team from '@/lib/models/Team';
import User from '@/lib/models/User';
import Project from '@/lib/models/Project';
import dbConnect from '@/lib/mongodb';

export async function PUT(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    const { name, leader, members } = await req.json();
    if (!name || !leader) {
      return Response.json({ success: false, error: 'Nama dan leader wajib diisi' }, { status: 400 });
    }
    const leaderUser = await User.findById(leader);
    if (!leaderUser) return Response.json({ success: false, error: 'Leader tidak ditemukan' }, { status: 404 });
    const memberUsers = members && members.length > 0 ? await User.find({ _id: { $in: members } }) : [];
    const team = await Team.findByIdAndUpdate(
      id,
      {
        name,
        leader: leaderUser._id,
        members: memberUsers.map(u => u._id),
      },
      { new: true }
    ).populate('leader').populate('members');
    if (!team) return Response.json({ success: false, error: 'Tim tidak ditemukan' }, { status: 404 });
    return Response.json({ success: true, data: team });
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    const team = await Team.findByIdAndDelete(id);
    if (!team) return Response.json({ success: false, error: 'Tim tidak ditemukan' }, { status: 404 });
    // Hapus referensi tim dari project
    await Project.updateMany({ teams: id }, { $pull: { teams: id } });
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
