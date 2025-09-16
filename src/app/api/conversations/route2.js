import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/lib/models/Lead';
import ChatMessage from '@/lib/models/ChatMessage'; // Pastikan ini diimpor
import { verifyAdmin } from '@/lib/auth'; // Gunakan sistem auth Anda

export async function GET(req) {
  try {
    await connectDB();

    const { success, admin } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 401 });
    }

    // Tentukan filter berdasarkan peran admin
    const matchFilter = {};
    if (admin.role !== 'superadmin') {
      matchFilter.assignedAgent = admin._id;
    }

    // Gunakan Aggregation Pipeline untuk efisiensi
    const conversations = await Lead.aggregate([
      // Tahap 1: Saring leads yang relevan (semua atau milik agen)
      { $match: matchFilter },

      // Tahap 2: "Join" dengan koleksi ChatMessage
      {
        $lookup: {
          from: 'chatmessages', // Nama koleksi di MongoDB (biasanya jamak & lowercase)
          localField: '_id',
          foreignField: 'lead',
          as: 'messages'
        }
      },

      // Tahap 3: Tambahkan field-field ringkasan
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ["$messages", -1] }, // Ambil elemen terakhir
          unreadCount: {
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

      // Tahap 4: Urutkan berdasarkan pesan terakhir
      { $sort: { "lastMessage.createdAt": -1 } },

      // Tahap 5: Format output akhir
      {
        $project: {
          _id: 0, // Hapus _id default dari agregasi
          id: "$_id",
          leadName: "$name",
          contact: "$contact",
          lastMessageText: "$lastMessage.body",
          timestamp: "$lastMessage.createdAt",
          unread: "$unreadCount",
          isNewAssignment: { $eq: ["$isResponded", false] }
        }
      }
    ]);

    return NextResponse.json({ success: true, conversations });

  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil percakapan" }, { status: 500 });
  }
}