import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import ChatMessage from "@/lib/models/ChatMessage";
import { NextResponse } from "next/server";
import { verifyAdmin, verifyAuth } from "@/lib/auth";
import { getUserConversationalScope } from "@/lib/team-helpers";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await dbConnect();

    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const currentUser = authResult.user;
    const currentUserId = currentUser._id.toString();

    let agentFilterIds = [];

    const matchFilter = {};
    if (!currentUser.role) {
      agentFilterIds = await getUserConversationalScope(currentUserId);
    }

    if (agentFilterIds.length > 0) {
      // Jika ada ID agent yang perlu difilter
      matchFilter["agent"] = {
        $in: agentFilterIds.map((id) => new mongoose.Types.ObjectId(id)),
      }; // Filter berdasarkan agent IDs yang ditentukan, pastikan ObjectId
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

      // Populate agent (user)
      {
        $lookup: {
          from: "users",
          localField: "agent",
          foreignField: "_id",
          as: "agentObj",
        },
      },
      {
        $addFields: {
          agent: { $arrayElemAt: ["$agentObj", 0] },
        },
      },
      // Tahap 4: Hitung SEMUA yang kita butuhkan dalam satu tahap
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ["$messages", -1] },
          // Cari pesan inbound terakhir
          lastInboundMessage: {
            $last: {
              $filter: {
                input: "$messages",
                cond: { $eq: ["$$this.direction", "inbound"] },
              },
            },
          },
          // Cari pesan template terakhir (asumsi ada field `isTemplate` di model ChatMessage)
          lastTemplateMessage: {
            $last: {
              $filter: {
                input: "$messages",
                cond: { $eq: ["$$this.isTemplate", true] },
              },
            },
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
                twentyFourHoursAgo: {
                  $subtract: [new Date(), 24 * 60 * 60 * 1000],
                },
                lastInboundTime: "$lastInboundMessage.sentAt",
                lastTemplateTime: "$lastTemplateMessage.sentAt",
              },
              in: {
                $gt: ["$$lastInboundTime", "$$twentyFourHoursAgo"],
              },
            },
          },
        },
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
            agent: {
              _id: "$agent._id",
              name: "$agent.name",
            },
            source: "$source",
            propertyName: "$propertyName",
            property: "$property",
            isClaimed: "$isClaimed",
            assignedAt: "$assignedAt",
            leadInAt: "$leadInAt",
            unread: "$unread",
          },
          lastMessage: 1,
          lastMessageText: "$lastMessage.body",
          lastMessageAt: "$lastMessage.sentAt",
          unread: "$unread",
          windowOpen: "$windowOpen",
          hasSentTemplate: {
            $cond: [
              {
                $and: [
                  { $gt: ["$lastTemplateMessage.sentAt", null] },
                  { $gt: ["$lastTemplateMessage.sentAt", {
                    $subtract: [new Date(), 24 * 60 * 60 * 1000]
                  }] }
                ]
              },
              true,
              false
            ]
          },
        },
      },
    ]);
    // Tambahkan flag isLeader dan agentIdsInScope jika user adalah leader (agentFilterIds.length > 1 dan !currentUser.role)
    const isLeader = !currentUser.role && agentFilterIds.length > 1;
    return NextResponse.json({
      conversations,
      isLeader,
      agentIdsInScope: agentFilterIds,
    });
  } catch (error) {
    console.error("GET conversations error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil percakapan" },
      { status: 500 }
    );
  }
}
