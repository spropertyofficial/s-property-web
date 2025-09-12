export function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function initialConversations() {
  const now = Date.now();
  return [
    { id: "c1", lead: { name: "Bapak Budi Santoso", phone: "08123...", source: "Website", status: "Hot", property: { name: "Avoria Estate", price: 650000000 } }, lastMessageText: "Baik, terima kasih infonya.", lastMessageAt: now - 60_000, timestamp: "10:30", unread: 0, assignedToMe: true, escalating: false, isNewAssignment: false, tags: ["baru"] },
    { id: "c2", lead: { name: "Ibu Sinta Dewi", phone: "08134...", source: "Instagram", status: "Warm", property: { name: "Ruko Komersial BSD", price: 2500000000 } }, lastMessageText: "Apakah ada promo KPR?", lastMessageAt: now - 5 * 60_000, timestamp: "09:15", unread: 1, assignedToMe: false, escalating: true, isNewAssignment: true, tags: ["hot"] },
    { id: "c3", lead: { name: "Calon Pembeli Baru", phone: "08156...", source: "WhatsApp", status: "Baru", property: { name: "Avoria Estate", price: 650000000 } }, lastMessageText: "Lokasi unit dimana?", lastMessageAt: now - 30 * 60_000, timestamp: "Baru Saja", unread: 1, assignedToMe: false, escalating: false, isNewAssignment: true, tags: [] },
  ];
}

export function initialMessagesById() {
  const now = Date.now();
  return {
    c1: [
      { id: makeId(), sender: "lead", body: "Halo, saya tertarik.", type: "text", ts: now - 5 * 60_000, status: "delivered" },
      { id: makeId(), sender: "me", body: "Baik kak, boleh saya bantu?", type: "text", ts: now - 4 * 60_000, status: "sent" },
      { id: makeId(), sender: "lead", body: "Terima kasih kak", type: "text", ts: now - 60_000, status: "read" },
    ],
    c2: [
      { id: makeId(), sender: "lead", body: "Boleh kirim brosur?", type: "text", ts: now - 5 * 60_000, status: "delivered" },
    ],
    c3: [
      { id: makeId(), sender: "lead", body: "Lokasi unit dimana?", type: "text", ts: now - 30 * 60_000, status: "delivered" },
    ],
  };
}
