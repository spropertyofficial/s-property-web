const documentRequirements = [
    {
      category: "Dokumen Pribadi",
      items: [
        "KTP Klien Dan Pasangan Suami / Istri",
        "No Telpon Klien Dan Pasangan",
        "NPWP Klien",
        "Akta Nikah",
        "Kartu Keluarga", 
        "Perjanjian Pisah Harta (Kalau Ada)",
        "Surat Keterangan Belum Menikah (Jika Single)"
      ]
    },
    {
      category: "Jika Karyawan",
      items: [
        "Surat Keterangan Kerja",
        "Mutasi Rekening Gaji Min 3 Bulan Terakhir",
        "Slip Gaji Terakhir"
      ]
    },
    {
      category: "Data Usaha",
      items: [
        "NPWP Usaha",
        "Akta Pendirian",
        "SIUP",
        "Akta Perubahan Terbaru",
        "TDP",
        "SK Menkeh (Jika Berbentuk PT)",
        "SK Domisili Usaha (Jika Ada)",
        "Bidang Usaha",
        "Usaha Berdiri Sejak Kapan",
        "Mutasi Rekening Gaji Min 6 Bulan Terakhir"
      ]
    }
  ];

  const additionalDocumentRequirements = [
    {
      category: "Data Relasi (Keluarga Terdekat Yang Tidak Tinggal Serumah)",
      items: [
        "Nama Lengkap Relasi",
        "Alamat Lengkap Relasi",
        "Nomer Handphone Relasi"
      ]
    },
    {
      category: "Data Jaminan",
      items: [
        "PBB (Distempel Agen Properti)",
        "IMB (Distempel Agen Properti)",
        "Sertifikat Rumah (Distempel Agen Properti)",
        "Bukti Bayar Appraisal (Rp. 1,1 juta untuk plafon < 1M, Rp. 1,5 juta untuk plafon > 1M)",
        "No Telpon Penjual dan Hubungannya Dengan Nama Di Sertifikat"
      ]
    },
    {
      category: "Data Agen Properti",
      items: [
        "Surat Pengantar Agen Properti",
        "Kartu Nama Agen Properti"
      ]
    },
    {
      category: "Data Pengajuan",
      items: [
        "Plafon Yang Diajukan",
        "Jangka Waktu Yang Diajukan", 
        "Program Bunga Yang Diajukan",
        "Rencana Budget / Nyaman Cicilan",
      ]
    }
  ];

  export { documentRequirements, additionalDocumentRequirements };