import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/lib/models/Registration";
import * as XLSX from "xlsx";

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get("status") || "",
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
    };

    const registrations = await Registration.getForExport(filters);

    // Prepare data for Excel
    const excelData = registrations.map((reg, index) => ({
      "No": index + 1,
      "Nama Lengkap": reg.personalData.fullName,
      "Tempat Lahir": reg.personalData.birthPlace,
      "Tanggal Lahir": new Date(reg.personalData.birthDate).toLocaleDateString("id-ID"),
      "Telepon": reg.personalData.phone,
      "Email": reg.personalData.email,
      "Telepon Referral": reg.personalData.referralPhone || "-",
      "Kota": reg.documents.city,
      "NIK": reg.documents.nik,
      "NPWP": reg.documents.npwp,
      "Nomor Rekening": reg.bankAccount.accountNumber,
      "Bank": reg.bankAccount.bankName,
      "Nama Pemilik Rekening": reg.bankAccount.accountHolder,
      "Status": reg.status,
      "Tanggal Daftar": new Date(reg.submittedAt).toLocaleString("id-ID"),
      "Catatan Review": reg.reviewNotes || "-",
      "Tanggal Review": reg.reviewedAt ? new Date(reg.reviewedAt).toLocaleString("id-ID") : "-",
      "KTP URL": reg.documents.ktpFile.url,
      "NPWP URL": reg.documents.npwpFile.url,
      "Buku Tabungan URL": reg.bankAccount.bankBookFile.url,
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    const colWidths = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxWidth = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          const cellLength = cell.v.toString().length;
          if (cellLength > maxWidth) {
            maxWidth = Math.min(cellLength, 50); // Max width 50
          }
        }
      }
      colWidths[C] = { width: maxWidth };
    }
    worksheet["!cols"] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrasi Partner");

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Create response with Excel file
    const response = new NextResponse(excelBuffer);
    response.headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="registrasi_partner_${new Date().toISOString().split('T')[0]}.xlsx"`
    );

    return response;

  } catch (error) {
    console.error("Error exporting registrations:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengexport data registrasi",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
