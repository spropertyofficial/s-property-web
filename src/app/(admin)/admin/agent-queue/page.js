"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// Komponen form proyek
function ProjectForm({ project, onSave, onCancel }) {
  const [name, setName] = useState(project?.name || "");
  const [whatsappNumber, setWhatsappNumber] = useState(project?.whatsappNumber || "");
  const [description, setDescription] = useState(project?.description || "");
  return (
    <div className="border p-4 rounded mb-4 bg-gray-50">
      <div className="mb-2 font-semibold">{project ? "Edit Proyek" : "Tambah Proyek"}</div>
      <input className="border rounded px-2 py-1 mb-2 w-full" placeholder="Nama Proyek" value={name} onChange={e => setName(e.target.value)} />
      <input className="border rounded px-2 py-1 mb-2 w-full" placeholder="Nomor WhatsApp" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} />
      <input className="border rounded px-2 py-1 mb-2 w-full" placeholder="Deskripsi" value={description} onChange={e => setDescription(e.target.value)} />
      <div className="flex gap-2">
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => onSave({ name, whatsappNumber, description, _id: project?._id })}>Simpan</button>
        <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={onCancel}>Batal</button>
      </div>
    </div>
  );
}

export default function AgentQueuePage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [agents, setAgents] = useState([]);
  const [lastAssignedIndex, setLastAssignedIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editAgents, setEditAgents] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [escalationMinutes, setEscalationMinutes] = useState(5);

  useEffect(() => {
    fetchProjects();
    fetchAllAgents();
  }, []);

  useEffect(() => {
    if (selectedProjectId) fetchQueue(selectedProjectId);
  }, [selectedProjectId]);

  async function fetchProjects() {
    try {
      const res = await axios.get("/api/project");
      setProjects(res.data.projects);
      if (res.data.projects.length > 0 && !selectedProjectId) setSelectedProjectId(res.data.projects[0]._id);
    } catch (err) {
      // ignore
    }
  }

  async function fetchQueue(projectId) {
    setLoading(true);
    try {
      const res = await axios.get(`/api/agent-queue?projectId=${projectId}`);
      setAgents(res.data.agents);
      setEditAgents(res.data.agents);
      setLastAssignedIndex(res.data.lastAssignedIndex);
      setEscalationMinutes(res.data.escalationMinutes);
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
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      await axios.post("/api/agent-queue", {
        agents: editAgents,
        lastAssignedIndex,
        escalationMinutes,
        projectId: selectedProjectId,
      });
      await fetchQueue(selectedProjectId);
      Swal.fire({ icon: "success", title: "Perubahan berhasil disimpan" });
    } catch (err) {
      setError("Gagal menyimpan perubahan");
      Swal.fire({ icon: "error", title: "Gagal menyimpan perubahan" });
    }
    setLoading(false);
  }

  async function handleProjectSave(data) {
    setLoading(true);
    try {
      await axios.post("/api/project", data);
      setProjectFormOpen(false);
      setEditProject(null);
      await fetchProjects();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal menyimpan proyek" });
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
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <h1 className="text-3xl font-semibold text-slate-800 text-center mb-8">Pengaturan Distribusi Lead</h1>
        {/* Pilih proyek */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-600 mb-2">Proyek</label>
          <div className="flex gap-3 items-center flex-wrap">
            <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition min-w-[250px]">
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name} ({p.whatsappNumber})</option>
              ))}
            </select>
            <button className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm hover:shadow transition" onClick={() => { setProjectFormOpen(true); setEditProject(null); }}>Tambah Proyek</button>
            {selectedProjectId && (
              <button className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-900 text-sm font-medium shadow-sm hover:shadow transition" onClick={() => { setProjectFormOpen(true); setEditProject(projects.find(p => p._id === selectedProjectId)); }}>Edit Proyek</button>
            )}
          </div>
        </div>
        {projectFormOpen && (
          <ProjectForm project={editProject} onSave={handleProjectSave} onCancel={() => { setProjectFormOpen(false); setEditProject(null); }} />
        )}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-600 mb-2">Giliran agent saat ini</label>
          {currentTurnAgent ? (
            <div className="px-4 py-3 rounded-xl bg-sky-50 text-sky-700 text-sm font-medium border border-sky-100 shadow-sm">{currentTurnAgent.name} ({currentTurnAgent.email})</div>
          ) : (
            <div className="px-4 py-3 rounded-xl bg-slate-100 text-slate-500 text-sm font-medium border border-slate-200">Belum ada agent aktif atau giliran tidak valid</div>
          )}
        </div>
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-600 mb-2">Ubah giliran ke agent</label>
          <select value={lastAssignedIndex} onChange={handleTurnChange} className="px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition min-w-[250px]">
            {activeAgents.map((a, idx) => (
              <option key={a.user._id} value={idx}>{a.user.name} ({a.user.email})</option>
            ))}
          </select>
        </div>
        <div className="mb-10">
          <label className="block text-sm font-semibold text-slate-600 mb-2">Durasi waktu eskalasi (menit)</label>
          <input
            type="number"
            min={1}
            value={escalationMinutes}
            onChange={e => setEscalationMinutes(parseInt(e.target.value, 10) || 1)}
            className="px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition w-40"
          />
        </div>
        {loading ? (
          <div className="py-8 text-center text-slate-500 font-medium">Loading...</div>
        ) : error ? (
          <div className="py-3 px-4 rounded-xl bg-rose-50 text-rose-600 text-sm border border-rose-200 font-medium">{error}</div>
        ) : (
          <>
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-600 mb-2">Pilih agent untuk ditambahkan</label>
              <div className="flex gap-3 flex-wrap items-center">
                <select
                  value={selectedAgentId}
                  onChange={e => setSelectedAgentId(e.target.value)}
                  className="px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition min-w-[250px]"
                >
                  <option value="">Pilih agent</option>
                  {allAgents
                    .filter(a => !editAgents.some(ea => ea.user._id === a._id))
                    .map(agent => (
                      <option key={agent._id} value={agent._id}>{agent.name} ({agent.email})</option>
                    ))}
                </select>
                <button
                  onClick={handleAddAgent}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm hover:shadow transition"
                >
                  Tambah Agent
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3 rounded-l-lg">Nama</th>
                    <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3">Order</th>
                    <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3">Active</th>
                    <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3 rounded-r-lg">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {editAgents.map((agent, idx) => (
                    <tr key={agent.user._id} className="shadow-sm">
                      <td className="bg-white px-4 py-3 rounded-l-lg text-sm text-slate-700 font-medium">{agent.user.name}</td>
                      <td className="bg-white px-4 py-3">
                        <input
                          type="number"
                          value={agent.order}
                          onChange={e => handleOrderChange(idx, e.target.value)}
                          className="w-20 px-3 py-2 rounded-lg border-2 border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                        />
                      </td>
                      <td className="bg-white px-4 py-3">
                        <input
                          type="checkbox"
                          checked={agent.active}
                          onChange={e => handleActiveChange(idx, e.target.checked)}
                          className="w-5 h-5 accent-emerald-600"
                        />
                      </td>
                      <td className="bg-white px-4 py-3 rounded-r-lg">
                        <button
                          onClick={() => handleRemoveAgent(idx)}
                          className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium shadow-sm hover:shadow transition"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleSave}
              className="w-full mt-8 px-6 py-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition"
              disabled={loading}
            >
              Simpan Perubahan
            </button>
          </>
        )}
      </div>
    </div>
  );
}
