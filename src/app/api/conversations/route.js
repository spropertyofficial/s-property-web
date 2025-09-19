import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";

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
  const conversations = await Lead.aggregate([
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
          leadInAt: "$leadInAt",
          name: "$name",
          contact: "$contact",
          agent: "$agent",
          source: "$source",
          status: "$status",
          attachments: "$attachments",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          unread: "$unread",
        },
        lastMessage: 1,
        lastMessageText: "$lastMessage.body",
        lastMessageAt: "$lastMessage.sentAt",
        unread: 1,
      },
    },
  ]);
  return Response.json({ conversations });
}
