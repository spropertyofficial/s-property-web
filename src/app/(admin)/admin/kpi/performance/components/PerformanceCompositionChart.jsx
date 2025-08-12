"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PerformanceCompositionChart({ composition }) {
  const labels = composition?.items?.map((i) => i.label) || [];
  const values = composition?.items?.map((i) => i.pendapatanTotal) || [];

  const data = {
    labels,
    datasets: [
      {
        label: "Pendapatan",
        data: values,
        backgroundColor: ["#14b8a6", "#0891b2", "#6366f1", "#8b5cf6", "#f59e0b", "#ef4444"],
        borderColor: ["#0d9488", "#0e7490", "#4f46e5", "#7c3aed", "#d97706", "#dc2626"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(ctx.raw || 0),
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
}
