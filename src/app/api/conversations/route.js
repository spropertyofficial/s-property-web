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

      // Tahap 2: Hanya proses leads yang memiliki lastMessageAt (sudah ada percakapan)
      { $match: { lastMessageAt: { $ne: null } } },

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

      // Lookup untuk unread dan windowOpen
      {
        $lookup: {
          from: "chatmessages",
          let: { leadId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$lead", "$$leadId"] } } },
            { $sort: { sentAt: -1, createdAt: -1 } },
          ],
          as: "messages",
        },
      },
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ["$messages", 0] },
          lastInboundMessage: {
            $first: {
              $filter: {
                input: "$messages",
                cond: { $eq: ["$$this.direction", "inbound"] },
              },
            },
          },
          lastTemplateMessage: {
            $first: {
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
                $cond: {
                  if: { $gt: ["$$lastInboundTime", "$$lastTemplateTime"] },
                  then: { $gt: ["$$lastInboundTime", "$$twentyFourHoursAgo"] },
                  else: { $gt: ["$$lastTemplateTime", "$$twentyFourHoursAgo"] },
                },
              },
            },
          },
        },
      },
      // Urutkan berdasarkan lastMessageAt
      { $sort: { lastMessageAt: -1 } },
      // Proyeksikan hanya field yang diperlukan
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
          lastMessageAt: "$lastMessageAt",
          unread: "$unread",
          windowOpen: "$windowOpen",
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
