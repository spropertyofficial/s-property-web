"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function AgentQueuePage() {
  const [agents, setAgents] = useState([]);
  const [lastAssignedIndex, setLastAssignedIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editAgents, setEditAgents] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [escalationMinutes, setEscalationMinutes] = useState(5);

  useEffect(() => {
    fetchQueue();
    fetchAllAgents();
  }, []);

  async function fetchQueue() {
    setLoading(true);
    try {
      const res = await axios.get("/api/agent-queue");
      setAgents(res.data.agents);
      setEditAgents(res.data.agents);
      setLastAssignedIndex(res.data.lastAssignedIndex);
      setError("");
    } catch (err) {
      setError("Gagal mengambil data agent queue");
    }
    setLoading(false);
  }

  async function fetchAllAgents() {
    try {
      const res = await axios.get("/api/agent-queue/all-agents");
      setAllAgents(res.data.agents);
    } catch (err) {
      // ignore error
    }
  }

  function handleOrderChange(idx, value) {
    const updated = [...editAgents];
    updated[idx].order = parseInt(value, 10) || 0;
    setEditAgents(updated);
  }

  function handleActiveChange(idx, value) {
    const updated = [...editAgents];
    updated[idx].active = value;
    setEditAgents(updated);
  }

  function handleRemoveAgent(idx) {
    const updated = [...editAgents];
    updated.splice(idx, 1);
    setEditAgents(updated);
  }

  function handleAddAgent() {
    if (!selectedAgentId) return;
    const agentUser = allAgents.find(a => a._id === selectedAgentId);
    if (!agentUser) return;
    // Cek duplikat
    if (editAgents.some(a => a.user._id === selectedAgentId)) return;
    setEditAgents([
      ...editAgents,
      {
        user: agentUser,
        order: editAgents.length + 1,
        active: true,
      },
    ]);
    setSelectedAgentId("");
  }

  async function handleSave() {
    setLoading(true);
    try {
      await axios.post("/api/agent-queue", {
        agents: editAgents,
        lastAssignedIndex,
        escalationMinutes,
      });
      await fetchQueue();
      Swal.fire({ icon: "success", title: "Perubahan berhasil disimpan" });
    } catch (err) {
      setError("Gagal menyimpan perubahan");
      Swal.fire({ icon: "error", title: "Gagal menyimpan perubahan" });
    }
    setLoading(false);
  }

  // Mendapatkan agent yang dapat giliran saat ini
  const activeAgents = editAgents.filter(a => a.active);
  const currentTurnAgent = activeAgents[lastAssignedIndex] ? activeAgents[lastAssignedIndex].user : null;

  function handleTurnChange(e) {
    setLastAssignedIndex(parseInt(e.target.value, 10));
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pengaturan Distribusi Agent</h1>
      {/* Info giliran agent saat ini */}
      <div className="mb-4">
        <div className="font-semibold mb-1">Giliran agent saat ini:</div>
        {currentTurnAgent ? (
          <div className="mb-2 p-2 bg-blue-50 rounded text-blue-800">
            {currentTurnAgent.name} ({currentTurnAgent.email})
          </div>
        ) : (
          <div className="mb-2 p-2 bg-gray-100 rounded text-gray-500">Belum ada agent aktif atau giliran tidak valid</div>
        )}
        <label className="block mb-1">Ubah giliran ke agent:</label>
        <select
          value={lastAssignedIndex}
          onChange={handleTurnChange}
          className="border rounded px-2 py-1"
        >
          {activeAgents.map((a, idx) => (
            <option key={a.user._id} value={idx}>
              {a.user.name} ({a.user.email})
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1 mt-4">Durasi waktu eskalasi (menit):</label>
        <input
          type="number"
          min={1}
          value={escalationMinutes}
          onChange={e => setEscalationMinutes(parseInt(e.target.value, 10) || 1)}
          className="border rounded px-2 py-1 w-24"
        />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="mb-4 flex gap-2 items-center">
            <select
              value={selectedAgentId}
              onChange={e => setSelectedAgentId(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">Pilih agent untuk ditambah</option>
              {allAgents
                .filter(a => !editAgents.some(ea => ea.user._id === a._id))
                .map(agent => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name} ({agent.email})
                  </option>
                ))}
            </select>
            <button
              onClick={handleAddAgent}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Tambah Agent
            </button>
          </div>
          <table className="w-full border mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Nama</th>
                <th className="p-2">Order</th>
                <th className="p-2">Active</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {editAgents.map((agent, idx) => (
                <tr key={agent.user._id}>
                  <td className="p-2">{agent.user.name}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={agent.order}
                      onChange={e => handleOrderChange(idx, e.target.value)}
                      className="border rounded px-2 py-1 w-16"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={agent.active}
                      onChange={e => handleActiveChange(idx, e.target.checked)}
                    />
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleRemoveAgent(idx)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            Simpan Perubahan
          </button>
        </>
      )}
    </div>
  );
}
