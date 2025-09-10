import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import ChatMessage from "@/lib/models/ChatMessage";

export async function GET(req) {
  await dbConnect();
  // TODO: Ganti dengan autentikasi agen jika sudah ada
  // Untuk sekarang, ambil semua leads dan chat terakhir
  const leads = await Lead.find({}).lean();
  // Ambil seluruh riwayat pesan untuk setiap lead
  const conversations = [];
  for (const lead of leads) {
    const messages = await ChatMessage.find({ lead: lead._id }).sort({ sentAt: 1 }).lean();
    if (messages.length > 0) {
      // Hitung jumlah pesan inbound yang belum dibaca (status 'received')
      const unread = messages.filter(m => m.direction === "inbound" && m.status === "received").length;
      // lastMessage tetap dikirim untuk preview panel kiri
      const lastMessage = messages[messages.length - 1];
      conversations.push({ lead, messages, lastMessage, unread });
    }
  }
  return Response.json({ conversations });
}