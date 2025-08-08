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
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function CompositionChart({ data }) {
  const topAgents = [...data]
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 5);

  const chartData = {
    labels: topAgents.map((a) => a.name),
    datasets: [
      {
        label: "Listing Baru",
        data: topAgents.map((a) => a.newListings),
        backgroundColor: "#14b8a6",
      },
      {
        label: "Survei Klien",
        data: topAgents.map((a) => a.surveys),
        backgroundColor: "#0891b2",
      },
      {
        label: "Sesi Live",
        data: topAgents.map((a) => a.liveSessions),
        backgroundColor: "#6366f1",
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
    plugins: { legend: { position: "bottom" } },
  };

  return <Bar options={options} data={chartData} />;
}
