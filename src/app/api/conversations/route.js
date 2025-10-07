import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import ChatMessage from "@/lib/models/ChatMessage";

export async function GET(req) {
  await dbConnect();
  // Autentikasi berbasis JWT dari cookie 'auth-token'
  const token = req.cookies.get("auth-token")?.value;
  if (!token) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  let userId = null;
  let isAdmin = false;
  try {
    const jwt = require("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
    // Bisa tambahkan logika admin/agen jika perlu
    if (decoded.type === "admin") {
      isAdmin = true;
    }
  } catch (err) {
    return Response.json(
      { success: false, error: "Invalid token" },
      { status: 401 }
    );
  }
  // Ambil ringkasan percakapan dengan aggregation pipeline
  const conversationsRaw = await Lead.aggregate([
    {
      $lookup: {
        from: "chatmessages", // nama koleksi di MongoDB
        localField: "_id",
        foreignField: "lead",
        as: "messages",
      },
    },
    { $match: { "messages.0": { $exists: true } } },
    {
      $addFields: {
        lastMessage: { $arrayElemAt: ["$messages", -1] },
        unread: {
          $size: {
            $filter: {
              input: "$messages",
              as: "msg",
              cond: {
                $and: [
                  { $eq: ["$$msg.direction", "inbound"] },
                  { $eq: ["$$msg.status", "received"] },
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        lead: {
          _id: "$_id",
          name: "$name",
          contact: "$contact",
          agent: "$agent",
          source: "$source",
          status: "$status",
          property: "$property",
          propertyName: "$propertyName",
          isClaimed: "$isClaimed",
          assignedAt: "$assignedAt",
          unread: "$unread",
        },
        lastMessage: 1,
        lastMessageText: "$lastMessage.body",
        lastMessageAt: "$lastMessage.sentAt",
        unread: 1,
      },
    },
  ]);

  // Untuk setiap conversation, tambahkan status window
  const conversations = await Promise.all(
    conversationsRaw.map(async (conv) => {
      const leadId = conv.lead._id;
      // Ambil pesan inbound terakhir (user) dan template outbound terakhir
      const lastInbound = await ChatMessage.getLastInboundMessage(leadId);
      const lastTemplate = await ChatMessage.getLastTemplateMessage(leadId);
      const now = Date.now();
      let windowOpen = false;
      let lastWindowTime = null;
      if (lastInbound && lastInbound.sentAt) {
        lastWindowTime = new Date(lastInbound.sentAt).getTime();
        // Jika ada pesan inbound setelah template, window direset oleh user
        if (lastTemplate && lastTemplate.sentAt) {
          const lastTemplateTime = new Date(lastTemplate.sentAt).getTime();
          if (lastInbound.sentAt > lastTemplate.sentAt) {
            // User membalas setelah template, window direset oleh user
            windowOpen = (now - lastWindowTime) <= 24 * 60 * 60 * 1000;
          } else {
            // Tidak ada inbound setelah template, window dari template
            windowOpen = (now - lastTemplateTime) <= 24 * 60 * 60 * 1000;
          }
        } else {
          // Tidak ada template, window dari inbound
          windowOpen = (now - lastWindowTime) <= 24 * 60 * 60 * 1000;
        }
      } else if (lastTemplate && lastTemplate.sentAt) {
        // Tidak ada inbound, window dari template
        const lastTemplateTime = new Date(lastTemplate.sentAt).getTime();
        windowOpen = (now - lastTemplateTime) <= 24 * 60 * 60 * 1000;
      }
      return { ...conv, windowOpen };
    })
  );
  return Response.json({ conversations });
}
