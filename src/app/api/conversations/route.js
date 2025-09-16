import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import ChatMessage from "@/lib/models/ChatMessage";

export async function GET(req) {
  await dbConnect();
  // TODO: Ganti dengan autentikasi agen jika sudah ada
  // Ambil semua leads dan ringkasan percakapan
  const leads = await Lead.find({}).lean();
  const conversations = await Promise.all(
    leads.map(async (lead) => {
      // Ambil pesan terakhir
      const lastMessage = await ChatMessage.findOne({ lead: lead._id })
        .sort({ sentAt: -1 })
        .lean();
      // Hitung jumlah pesan inbound yang belum dibaca
      const unread = await ChatMessage.countDocuments({
        lead: lead._id,
        direction: "inbound",
        status: "received",
      });
      return {
        lead,
        lastMessage,
        lastMessageText: lastMessage?.body || "",
        lastMessageAt: lastMessage?.sentAt || null,
        unread,
      };
    })
  );
  return Response.json({ conversations });
}