"use client";
import { useCallback, useEffect, useState } from "react";

export default function useLeads(initial = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initial.page || 1);
  const [limit, setLimit] = useState(initial.limit || 10);
  const [q, setQ] = useState(initial.q || "");
  const [status, setStatus] = useState(initial.status || "");
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLeads = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", limit);
  if (q) params.set("q", q);
  if (status) params.set("status", status);
      const res = await fetch(`/api/leads?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal memuat");
      setData(json.data || []);
      setTotalPages(json.totalPages || 1);
      setTotal(json.total || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, status]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Auto refresh on global lead events
  useEffect(() => {
    function handler() { fetchLeads(); }
    window.addEventListener('lead:created', handler);
    window.addEventListener('lead:updated', handler);
    window.addEventListener('lead:status', handler);
  window.addEventListener('lead:attachments', handler);
    window.addEventListener('lead:deleted', handler);
    return () => {
      window.removeEventListener('lead:created', handler);
      window.removeEventListener('lead:updated', handler);
      window.removeEventListener('lead:status', handler);
  window.removeEventListener('lead:attachments', handler);
      window.removeEventListener('lead:deleted', handler);
    };
  }, [fetchLeads]);

  return {
  data, loading, error, page, limit, q, status, totalPages, total,
  setPage, setLimit, setQ, setStatus, refresh: fetchLeads,
  };
}
