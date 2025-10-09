import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import ChatMessage from "@/lib/models/ChatMessage";
import { NextResponse } from "next/server";
import { verifyAdmin, verifyAuth } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    const { success, user } = await verifyAuth(req);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const matchFilter = {};
    if (!user.role ) {
      matchFilter.agent = user._id;
    }
    // Ambil ringkasan percakapan dengan aggregation pipeline
    const conversations = await Lead.aggregate([
      // Tahap 1: Saring leads yang relevan
      { $match: matchFilter },
      
      // Tahap 2: "Join" dengan koleksi ChatMessage
      {
        $lookup: {
          from: "chatmessages",
          localField: "_id",
          foreignField: "lead",
          as: "messages",
        },
      },
      
      // Tahap 3: Hanya proses leads yang memiliki setidaknya satu pesan
      { $match: { "messages.0": { $exists: true } } },

      // Tahap 4: Hitung SEMUA yang kita butuhkan dalam satu tahap
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ["$messages", -1] },
          // Cari pesan inbound terakhir
          lastInboundMessage: {
            $last: {
              $filter: {
                input: "$messages",
                cond: { $eq: ["$$this.direction", "inbound"] }
              }
            }
          },
          // Cari pesan template terakhir (asumsi ada field `isTemplate` di model ChatMessage)
          lastTemplateMessage: {
            $last: {
              $filter: {
                input: "$messages",
                cond: { $eq: ["$$this.isTemplate", true] }
              }
            }
          },
          unread: {
            $size: {
              $filter: {
                input: "$messages",
                cond: {
                  $and: [
                    { $eq: ["$$this.direction", "inbound"] },
                    { $eq: ["$$this.status", "received"] },
                  ],
                },
              },
            },
          },
        },
      },

      // Tahap 5: Hitung status 'windowOpen'
      {
        $addFields: {
            windowOpen: {
                $let: {
                    vars: {
                        now: new Date(),
                        twentyFourHoursAgo: { $subtract: [new Date(), 24 * 60 * 60 * 1000] },
                        lastInboundTime: "$lastInboundMessage.sentAt",
                        lastTemplateTime: "$lastTemplateMessage.sentAt",
                    },
                    in: {
                        $cond: {
                            if: { $gt: ["$$lastInboundTime", "$$lastTemplateTime"] },
                            then: { $gt: ["$$lastInboundTime", "$$twentyFourHoursAgo"] },
                            else: { $gt: ["$$lastTemplateTime", "$$twentyFourHoursAgo"] }
                        }
                    }
                }
            }
        }
      },
      
      // Tahap 6: Urutkan berdasarkan pesan terakhir
      // { $sort: { "lastMessage.createdAt": -1 } },

      // Tahap 7: Proyeksikan hanya field yang diperlukan
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
          unread: "$unread",
          windowOpen: "$windowOpen",
        },
      },
    ]);

    // // Untuk setiap conversation, tambahkan status window
    // const conversations = await Promise.all(
    //   conversationsRaw.map(async (conv) => {
    //     const leadId = conv.lead._id;
    //     // Ambil pesan inbound terakhir (user) dan template outbound terakhir
    //     const lastInbound = await ChatMessage.getLastInboundMessage(leadId);
    //     const lastTemplate = await ChatMessage.getLastTemplateMessage(leadId);
    //     const now = Date.now();
    //     let windowOpen = false;
    //     let lastWindowTime = null;
    //     if (lastInbound && lastInbound.sentAt) {
    //       lastWindowTime = new Date(lastInbound.sentAt).getTime();
    //       // Jika ada pesan inbound setelah template, window direset oleh user
    //       if (lastTemplate && lastTemplate.sentAt) {
    //         const lastTemplateTime = new Date(lastTemplate.sentAt).getTime();
    //         if (lastInbound.sentAt > lastTemplate.sentAt) {
    //           // User membalas setelah template, window direset oleh user
    //           windowOpen = now - lastWindowTime <= 24 * 60 * 60 * 1000;
    //         } else {
    //           // Tidak ada inbound setelah template, window dari template
    //           windowOpen = now - lastTemplateTime <= 24 * 60 * 60 * 1000;
    //         }
    //       } else {
    //         // Tidak ada template, window dari inbound
    //         windowOpen = now - lastWindowTime <= 24 * 60 * 60 * 1000;
    //       }
    //     } else if (lastTemplate && lastTemplate.sentAt) {
    //       // Tidak ada inbound, window dari template
    //       const lastTemplateTime = new Date(lastTemplate.sentAt).getTime();
    //       windowOpen = now - lastTemplateTime <= 24 * 60 * 60 * 1000;
    //     }
    //     return { ...conv, windowOpen };
    //   })
    // );
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("GET conversations error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil percakapan" },
      { status: 500 }
    );
  }
}
