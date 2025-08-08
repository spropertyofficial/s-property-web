"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default function TrendChart({ data }) {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: "Total Aktivitas",
        data: Object.values(data),
        borderColor: "#0d9488",
        backgroundColor: "rgba(13, 148, 136, 0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { type: "time", time: { unit: "day" } },
      y: { beginAtZero: true },
    },
    plugins: { legend: { display: false } },
  };

  return <Line options={options} data={chartData} />;
}
