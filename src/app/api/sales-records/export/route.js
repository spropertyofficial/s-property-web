import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyAdminWithRole } from "@/lib/auth";
import SaleRecord from "@/lib/models/SaleRecord";
import CategoryAssetType from "@/lib/models/CategoryAssetType";

function toMonthRange(start, end) {
	if (!start || !end) return null;
	const [ys, ms] = start.split("-").map(Number);
	const [ye, me] = end.split("-").map(Number);
	if (!ys || !ms || !ye || !me) return null;
	const s = new Date(Date.UTC(ys, ms - 1, 1));
	const e = new Date(Date.UTC(ye, me, 1)); // exclusive
	return { s, e };
}

function asCSV(rows) {
	const escape = (v) => {
		if (v === null || v === undefined) return "";
		const s = String(v);
		if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
		return s;
	};
	if (!rows || rows.length === 0) return "";
	const headers = Object.keys(rows[0]);
	const lines = [headers.join(",")];
	for (const r of rows) {
		lines.push(headers.map((h) => escape(r[h])).join(","));
	}
	return lines.join("\n");
}

export async function GET(req) {
	try {
		const auth = await verifyAdminWithRole(req, ["superadmin", "editor"]);
		if (auth.error) return auth.error;
		await connectDB();

		const { searchParams } = new URL(req.url);
		const type = searchParams.get("type") || "detail"; // detail|rekap|komposisi
		const start = searchParams.get("start"); // YYYY-MM
		const end = searchParams.get("end"); // YYYY-MM
		const range = toMonthRange(start, end);
		if (!range) return NextResponse.json({ success: false, error: "start/end tidak valid" }, { status: 400 });

		const match = { status: "Closed", tanggalClosing: { $gte: range.s, $lt: range.e } };

		if (type === "detail") {
			const rows = await SaleRecord.find(match)
				.populate({ path: "agentId", select: "name agentCode" })
				.sort({ tanggalClosing: 1 })
				.lean();

			const data = rows.map((r) => ({
				tanggal: r.tanggalClosing ? new Date(r.tanggalClosing).toISOString().slice(0, 10) : "",
				agent: r.agentId?.name || "",
				agentCode: r.agentId?.agentCode || "",
				projectName: r.projectName || "",
				block: r.block || "",
				unitType: r.unitType || "",
				harga: r.hargaPropertiTerjual || 0,
				notes: r.notes || "",
			}));
			const csv = asCSV(data);
			return new NextResponse(csv, {
				status: 200,
				headers: {
					"Content-Type": "text/csv; charset=utf-8",
					"Content-Disposition": `attachment; filename="sales-detail_${start}_${end}.csv"`,
				},
			});
		}

		if (type === "rekap") {
			const rows = await SaleRecord.aggregate([
				{ $match: match },
				{
					$group: {
						_id: { $dateToString: { format: "%Y-%m", date: "$tanggalClosing", timezone: "UTC" } },
						pendapatan: { $sum: "$hargaPropertiTerjual" },
						unit: { $sum: 1 },
					},
				},
				{ $sort: { _id: 1 } },
			]);
			const data = rows.map((r) => ({ bulan: r._id, pendapatan: r.pendapatan, unit: r.unit }));
			const csv = asCSV(data);
			return new NextResponse(csv, {
				status: 200,
				headers: {
					"Content-Type": "text/csv; charset=utf-8",
					"Content-Disposition": `attachment; filename="sales-rekap_${start}_${end}.csv"`,
				},
			});
		}

		if (type === "komposisi") {
			const rows = await SaleRecord.aggregate([
				{ $match: match },
				{
					$group: {
						_id: "$assetTypeId",
						pendapatan: { $sum: "$hargaPropertiTerjual" },
					},
				},
				{ $sort: { pendapatan: -1 } },
			]);
			// fetch labels
			const ids = rows.map((r) => r._id).filter(Boolean);
			const types = await CategoryAssetType.find({ _id: { $in: ids } }).lean();
			const labelMap = new Map(types.map((t) => [String(t._id), t.name]));
			const data = rows.map((r) => ({ tipeAset: labelMap.get(String(r._id)) || "(Tidak diisi)", pendapatan: r.pendapatan }));
			const csv = asCSV(data);
			return new NextResponse(csv, {
				status: 200,
				headers: {
					"Content-Type": "text/csv; charset=utf-8",
					"Content-Disposition": `attachment; filename="sales-komposisi_${start}_${end}.csv"`,
				},
			});
		}

		return NextResponse.json({ success: false, error: "type tidak dikenal" }, { status: 400 });
	} catch (error) {
		console.error("GET /api/sales-records/export error:", error);
		return NextResponse.json({ success: false, error: "Gagal membuat export" }, { status: 500 });
	}
}

