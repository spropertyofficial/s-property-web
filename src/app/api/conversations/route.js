import dbConnect from "../../../lib/dbConnect";
import Lead from "../../../lib/models/Lead";
import ChatMessage from "../../../lib/models/ChatMessage";

export async function GET(req) {
  await dbConnect();
  // TODO: Ganti dengan autentikasi agen jika sudah ada
  // Untuk sekarang, ambil semua leads dan chat terakhir
  const leads = await Lead.find({}).lean();
  // Ambil chat terakhir untuk setiap lead
  const conversations = await Promise.all(
    leads.map(async (lead) => {
      const lastMessage = await ChatMessage.findOne({ lead: lead._id })
        .sort({ timestamp: -1 })
        .lean();
      return {
        lead,
        lastMessage,
      };
    })
  );
  return Response.json({ conversations });
}