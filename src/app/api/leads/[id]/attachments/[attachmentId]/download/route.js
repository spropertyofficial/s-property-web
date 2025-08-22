import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import { verifyAdmin, verifyUser } from "@/lib/auth";

function buildAttachmentUrlForDownload(originalUrl, filename) {
	if (!originalUrl) return originalUrl;
	const marker = "/upload/";
	const idx = originalUrl.indexOf(marker);
	if (idx === -1) return originalUrl; // fallback
	const prefix = originalUrl.substring(0, idx + marker.length);
	const suffix = originalUrl.substring(idx + marker.length);
	// Insert fl_attachment with encoded filename; Cloudinary will keep original extension
	const safeName = encodeURIComponent(filename || "download");
	return `${prefix}fl_attachment:${safeName}/${suffix}`;
}

export async function GET(req, { params }) {
	try {
		await dbConnect();
		const { id, attachmentId } = params;

		// Auth: admin or owning agent
		const adminAuth = await verifyAdmin(req);
		let userAuth = null;
		const filter = { _id: id };
		if (!adminAuth.success) {
			userAuth = await verifyUser(req);
			if (!userAuth.success)
				return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 401 });
			filter.agent = userAuth.user._id;
		}

		const lead = await Lead.findOne(filter);
		if (!lead)
			return NextResponse.json({ success: false, error: "Lead tidak ditemukan" }, { status: 404 });

		// Locate attachment by _id or index fallback
		let att = lead.attachments.id(attachmentId);
		if (!att) {
			const idx = Number.isInteger(Number(attachmentId)) ? Number(attachmentId) : -1;
			if (idx >= 0 && idx < lead.attachments.length) att = lead.attachments[idx];
		}
		if (!att)
			return NextResponse.json({ success: false, error: "Lampiran tidak ditemukan" }, { status: 404 });

		const filename = att.title || "download";
		const target = buildAttachmentUrlForDownload(att.url, filename);
		// Redirect to Cloudinary URL that forces download via fl_attachment
		return NextResponse.redirect(target, 302);
	} catch (e) {
		return NextResponse.json({ success: false, error: "Gagal memproses unduhan" }, { status: 500 });
	}
}

