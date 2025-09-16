
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";

export async function GET(req) {
  await dbConnect();
  // TODO: Ganti dengan autentikasi agen jika sudah ada
  // Ambil ringkasan percakapan dengan aggregation pipeline
  const conversations = await Lead.aggregate([
    {
      $lookup: {
        from: "chatmessages", // nama koleksi di MongoDB
        localField: "_id",
        foreignField: "lead",
        as: "messages"
      }
    },
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
                  { $eq: ["$$msg.status", "received"] }
                ]
              }
            }
          }
        }
      }
    },
    {
      $project: {
        lead: "$$ROOT",
        lastMessage: 1,
        lastMessageText: "$lastMessage.body",
        lastMessageAt: "$lastMessage.sentAt",
        unread: 1
      }
    }
  ]);
  return Response.json({ conversations });
}