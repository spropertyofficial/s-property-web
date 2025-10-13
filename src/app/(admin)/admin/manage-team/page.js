"use client";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { IoIosArrowDroprightCircle } from "react-icons/io";

// Helper modal component
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-50 bg-white rounded-lg shadow-2xl p-6 min-w-[600px] max-w-3xl w-full">
        {children}
      </div>
    </div>
  );
}

export default function ManageTeamPage() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [expanded, setExpanded] = useState(null); // projectId
  const [modal, setModal] = useState(null); // {type, project, team}
  const [form, setForm] = useState({
    name: "",
    whatsappNumber: "",
    description: "",
    agentQueue: "",
    leader: "",
    members: [],
    project: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef();

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    await Promise.all([fetchProjects(), fetchUsers()]);
  }
  async function fetchProjects() {
    try {
      const res = await fetch("/api/project");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setProjects(json.data);
      else if (Array.isArray(json.projects)) setProjects(json.projects);
    } catch {}
  }
  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users/all-users");
      const json = await res.json();
      if (json) setUsers(json.agents);
    } catch {}
  }

  // Accordion expand/collapse
  function handleExpand(projectId) {
    setExpanded(expanded === projectId ? null : projectId);
  }

  // Modal openers
  function openProjectModal(project = null) {
    setForm({
      name: project?.name || "",
      whatsappNumber: project?.whatsappNumber || "",
      description: project?.description || "",
      agentQueue: project?.agentQueue?._id || project?.agentQueue || "",
      project: project?._id || "",
    });
    setModal({ type: "project", project });
  }
  function openTeamModal(project, team = null) {
    setForm({
      name: team?.name || "",
      leader: team?.leader?._id || "",
      members: team?.members?.map((m) => m._id) || [],
      project: project._id,
    });
    setModal({ type: "team", project, team });
  }
  function openDeleteModal(type, project, team = null) {
    setModal({ type: "delete", project, team });
  }

  // Modal close
  function closeModal() {
    setModal(null);
    setError(null);
    setSuccess(null);
    setForm({ name: "", leader: "", members: [], project: "" });
  }

  // Form handlers
  function handleFormChange(e) {
    const { name, value, type, selectedOptions } = e.target;
    if (type === "select-multiple") {
      setForm((f) => ({
        ...f,
        [name]: Array.from(selectedOptions, (o) => o.value),
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  async function handleProjectSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const method = modal.project ? "PUT" : "POST";
      const url = modal.project
        ? `/api/project/${modal.project._id}`
        : "/api/project";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          whatsappNumber: form.whatsappNumber,
        }),
      });
      const json = await res.json();
      if (json.success) {
        closeModal();
        fetchProjects();
      } else {
        setError(json.error || "Gagal menyimpan proyek");
      }
    } catch {
      setError("Gagal menyimpan proyek");
    } finally {
      setLoading(false);
    }
  }

  async function handleTeamSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const method = modal.team ? "PUT" : "POST";
      const url = modal.team
        ? `/api/admin/manage-team/teams/${modal.team._id}`
        : "/api/admin/manage-team/teams";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          leader: form.leader,
          members: form.members,
          project: form.project,
        }),
      });
      const json = await res.json();
      if (json.success) {
        closeModal();
        fetchProjects();
      } else {
        setError(json.error || "Gagal menyimpan tim");
      }
    } catch {
      setError("Gagal menyimpan tim");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      let url = "";
      if (modal.team) url = `/api/manage-team/teams/${modal.team._id}`;
      else url = `/api/project/${modal.project._id}`;
      const res = await fetch(url, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        closeModal();
        fetchProjects();
      } else {
        setError(json.error || "Gagal menghapus");
      }
    } catch {
      setError("Gagal menghapus");
    } finally {
      setLoading(false);
    }
  }

  // Render
  return (
    <div className="main-content-area min-h-screen bg-slate-50">
      <div className="p-6 border-b border-slate-200 bg-white flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Manajemen Proyek dan Tim
          </h1>
          <p className="text-slate-500 mt-1">
            Buka setiap proyek untuk melihat dan mengelola tim sales.
          </p>
        </div>
        <button
          onClick={() => openProjectModal()}
          className="flex items-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-sky-700"
        >
          <span className="mr-2">+</span> Proyek Baru
        </button>
      </div>
      <div className="projects-container p-6 space-y-4">
        {projects.length === 0 ? (
          <div className="text-center text-slate-500 py-16">
            <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-slate-200 rounded-full">
              <span className="text-4xl">📁</span>
            </div>
            <h3 className="text-lg font-semibold">Belum Ada Proyek</h3>
            <p>Tambah proyek baru.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project._id}
              className={`accordion-item bg-white border border-slate-200 rounded-lg shadow-sm ${
                expanded === project._id ? "expanded" : ""
              }`}
            >
              <div
                className="accordion-header flex items-center p-4 cursor-pointer"
                onClick={() => handleExpand(project._id)}
              >
                <span
                  className={`chevron w-5 h-5 mr-3 text-slate-400 transition-transform ${
                    expanded === project._id ? "rotate-90" : ""
                  }`}
                >
                  <IoIosArrowDroprightCircle />
                </span>
                <div className="flex-1">
                  <h2 className="project-name text-lg font-semibold text-slate-800">
                    {project.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    WA: {project.whatsappNumber || "-"}
                  </p>
                  {project.description && (
                    <p className="text-xs text-slate-400 mt-1">
                      {project.description}
                    </p>
                  )}
                  <p className="team-count-info text-sm text-slate-500 mt-1">
                    {project.teams?.length || 0} tim
                  </p>
                </div>
                <div className="actions flex items-center gap-2">
                  <button
                    className="add-team-btn p-2 text-slate-500 hover:text-green-600 hover:bg-green-100 rounded-md"
                    title="Tambah Tim"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTeamModal(project);
                    }}
                  >
                    <span>👥</span>
                  </button>
                  <button
                    className="edit-project-btn p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-md"
                    title="Edit Proyek"
                    onClick={(e) => {
                      e.stopPropagation();
                      openProjectModal(project);
                    }}
                  >
                    <span>✏️</span>
                  </button>
                  <button
                    className="delete-project-btn p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-md"
                    title="Hapus Proyek"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal("project", project);
                    }}
                  >
                    <span>🗑️</span>
                  </button>
                </div>
              </div>
              {expanded === project._id && (
                <div className="accordion-content">
                  <div className="teams-grid p-6 border-t border-slate-200 bg-slate-50/50">
                    {project.teams && project.teams.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {project.teams.map((team) => (
                          <div
                            key={team._id}
                            className="team-card-root bg-white border border-slate-200 rounded-lg p-4 shadow-sm"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <h3 className="team-name text-base font-semibold text-slate-800">
                                {team.name}
                              </h3>
                              <div className="flex items-center gap-1">
                                <button
                                  className="edit-team-btn p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openTeamModal(project, team);
                                  }}
                                >
                                  <span>✏️</span>
                                </button>
                                <button
                                  className="delete-team-btn p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteModal("team", project, team);
                                  }}
                                >
                                  <span>✖️</span>
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="leader-section">
                                <p className="text-xs text-slate-500 font-medium mb-2">
                                  LEADER
                                </p>
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-full text-slate-500">
                                    <span>🛡️</span>
                                  </div>
                                  <div>
                                    <p className="leader-name font-semibold text-slate-700">
                                      {team.leader?.name || "-"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="members-section">
                                <p className="text-xs text-slate-500 font-medium mb-2">
                                  ANGGOTA
                                </p>
                                <div className="member-names-list space-y-1">
                                  {team.members && team.members.length > 0 ? (
                                    team.members.map((m) => (
                                      <p
                                        key={m._id}
                                        className="text-sm text-slate-600"
                                      >
                                        {m.name}
                                      </p>
                                    ))
                                  ) : (
                                    <p className="text-sm text-slate-400 italic">
                                      Belum ada anggota
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">
                        Belum ada tim di proyek ini.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Project Modal */}
      <Modal open={modal?.type === "project"} onClose={closeModal}>
        <form onSubmit={handleProjectSubmit} ref={formRef}>
          <h3 className="text-xl font-bold text-slate-900 mb-6">
            {modal?.project ? "Edit Proyek" : "Tambah Proyek Baru"}
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama Proyek
            </label>
            <input
              type="text"
              name="name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
              value={form.name}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nomor WhatsApp Proyek
            </label>
            <input
              type="text"
              name="whatsappNumber"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              value={form.whatsappNumber || ""}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              onClick={closeModal}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </form>
      </Modal>

      {/* Team Modal */}
      <Modal open={modal?.type === "team"} onClose={closeModal}>
        <TeamFormWithSearch
          form={form}
          setForm={setForm}
          users={users}
          loading={loading}
          error={error}
          closeModal={closeModal}
          handleTeamSubmit={handleTeamSubmit}
          formRef={formRef}
          modal={modal}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal open={modal?.type === "delete"} onClose={closeModal}>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <span className="text-2xl text-red-600">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Anda yakin ingin menghapus?
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-center gap-3">
            <button
              className="px-4 py-2 w-full text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              onClick={closeModal}
            >
              Batal
            </button>
            <button
              className="px-4 py-2 w-full text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </div>
      </Modal>
    </div>
  );
}

function TeamFormWithSearch({
  form,
  setForm,
  users,
  loading,
  error,
  closeModal,
  handleTeamSubmit,
  formRef,
  modal,
}) {
  const [userQuery, setUserQuery] = useState("");
  const [selectingRole, setSelectingRole] = useState(null); // 'leader' | 'member' | null
  // Filter users that are not already selected as leader or member
  const availableUsers = users?.filter(
    (u) =>
      !form.members.includes(u._id) &&
      form.leader !== u._id &&
      (u.name?.toLowerCase().includes(userQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(userQuery.toLowerCase()))
  );
  // Helper to get user object by id
  const getUserById = (id) => users?.find((u) => u._id === id);

  // Handler: assign user to role if selectingRole is set
  function handleUserClick(u) {
    if (selectingRole === "leader") {
      setForm(f => ({ ...f, leader: u._id }));
      setSelectingRole(null);
    } else if (selectingRole === "member") {
      // Multi-select: add user to members, keep mode
      setForm(f => ({ ...f, members: f.members.includes(u._id) ? f.members : [...f.members, u._id] }));
    }
  }

  // Handler: finish member selection
  function handleSelesaiMember() {
    setSelectingRole(null);
  }

  return (
    <form onSubmit={handleTeamSubmit} ref={formRef}>
      <h3 className="text-xl font-bold text-slate-900 mb-6">
        {modal?.team ? "Edit Tim" : "Tambah Tim Baru"}
      </h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">Nama Tim</label>
        <input
          type="text"
          name="name"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left: All users */}
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-slate-700 mb-2">Daftar User</label>
          <div className="flex gap-2 mb-2 sticky top-0 bg-white z-10">
            <input
              type="text"
              placeholder="Cari nama/email..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              value={userQuery}
              onChange={e => setUserQuery(e.target.value)}
            />
            {userQuery && (
              <button type="button" className="text-xs px-2 py-1 bg-slate-100 rounded" onClick={() => setUserQuery("")}>Clear</button>
            )}
          </div>
          <div className={`max-h-64 overflow-y-auto border rounded-lg divide-y bg-slate-50 ${selectingRole ? 'ring-2 ring-sky-400' : ''}`}>
            {availableUsers?.length === 0 && <div className="p-2 text-slate-400 text-sm">Tidak ada user ditemukan</div>}
            {availableUsers?.map(u => (
              <div
                key={u._id}
                className={`flex items-center justify-between px-3 py-2 gap-2 hover:bg-sky-50 cursor-pointer ${selectingRole ? 'hover:bg-sky-100' : 'opacity-60 pointer-events-none'}`}
                onClick={() => selectingRole && handleUserClick(u)}
                tabIndex={selectingRole ? 0 : -1}
                aria-disabled={!selectingRole}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 truncate">{u.name}</div>
                  <div className="text-xs text-slate-500 truncate">{u.email}</div>
                </div>
                {selectingRole === 'member' && (
                  <input
                    type="checkbox"
                    checked={form.members.includes(u._id)}
                    readOnly
                    className="h-4 w-4 text-green-600 border-green-300"
                  />
                )}
              </div>
            ))}
          </div>
          {selectingRole === null && (
            <div className="text-xs text-slate-400 mt-2">Klik kolom Leader/Anggota di kanan untuk memilih user</div>
          )}
          {selectingRole === 'leader' && (
            <div className="text-xs text-sky-600 mt-2">Klik user untuk dijadikan Leader</div>
          )}
          {selectingRole === 'member' && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-green-600">Klik user untuk tambah ke Anggota. Centang = sudah dipilih.</span>
              <button type="button" className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200" onClick={handleSelesaiMember}>Selesai</button>
            </div>
          )}
        </div>
        {/* Right: Selected leader and members */}
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          {/* Leader */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Leader</label>
            <div
              className={`p-3 rounded-lg border mb-2 cursor-pointer transition-colors ${selectingRole === 'leader' ? 'ring-2 ring-sky-400 bg-sky-50' : 'hover:bg-sky-50'}`}
              onClick={() => setSelectingRole('leader')}
              tabIndex={0}
            >
              {form.leader ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800">{getUserById(form.leader)?.name}</div>
                    <div className="text-xs text-slate-500">{getUserById(form.leader)?.email}</div>
                  </div>
                  <button
                    type="button"
                    className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 ml-2"
                    onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, leader: "" })); }}
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <div className="text-slate-400 text-sm italic">Klik di sini lalu pilih user</div>
              )}
            </div>
          </div>
          {/* Members */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Anggota Tim</label>
            <div
              className={`rounded border p-2 min-h-[48px] cursor-pointer transition-colors ${selectingRole === 'member' ? 'ring-2 ring-green-400 bg-green-50' : 'hover:bg-green-50'}`}
              onClick={() => setSelectingRole('member')}
              tabIndex={0}
            >
              {form.members.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {form.members.map(id => (
                    <div key={id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-800">{getUserById(id)?.name}</div>
                        <div className="text-xs text-slate-500">{getUserById(id)?.email}</div>
                      </div>
                      <button
                        type="button"
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 ml-2"
                        onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, members: f.members.filter(mid => mid !== id) })); }}
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-sm italic">Klik di sini lalu pilih user</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-8">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg"
          onClick={closeModal}
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Tim"}
        </button>
      </div>
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </form>
  );
}
