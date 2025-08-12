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

export default function PerformanceTrendChart({ trend }) {
  const labels = trend?.labels || [];
  const values = trend?.pendapatan || [];

  const data = {
    labels,
    datasets: [
      {
        label: "Pendapatan",
        data: values,
        backgroundColor: "#14b8a6",
        borderColor: "#0d9488",
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
