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

export default function CompositionChart({ data }) {
  const labels = Object.keys(data || {});
  const values = Object.values(data || {});
  
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Aktivitas",
        data: values,
        backgroundColor: ["#14b8a6", "#0891b2", "#6366f1", "#8b5cf6", "#f59e0b"],
        borderColor: ["#0d9488", "#0e7490", "#4f46e5", "#7c3aed", "#d97706"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
