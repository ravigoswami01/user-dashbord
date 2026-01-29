"use client";

import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { User } from "./UserCart";

ChartJS.register(ArcElement, Tooltip, Legend);

interface UserStatusChartProps {
  users: User[];
  loading: boolean;
}

const UserStatusChart: React.FC<UserStatusChartProps> = ({
  users,
  loading,
}) => {
  const chartData = useMemo(() => {
    if (users.length === 0) {
      return null;
    }

    // Count users by status
    const statusCounts = users.reduce(
      (acc, user) => {
        const status = user.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);

    // Color mapping for statuses
    const statusColors: Record<string, string> = {
      Active: "#10b981",
      Inactive: "#ef4444",
      Unknown: "#9ca3af",
    };

    const backgroundColor = labels.map(
      (label) => statusColors[label] || "#6366f1",
    );
    const borderColor = labels.map((label) => statusColors[label] || "#6366f1");

    return {
      labels,
      datasets: [
        {
          label: "Number of Users",
          data,
          backgroundColor,
          borderColor,
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };
  }, [users]);

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: "bold",
          },
          color: "#374151",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 12 },
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce(
              (a, b) => (a as number) + (typeof b === "number" ? b : 0),
              0,
            ) as number;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-gray-600 font-medium">No data available</p>
          <p className="text-sm text-gray-500 mt-1">
            Adjust your filters to see user status distribution
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 ">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Users by Status</h3>
      <div className="relative h-80 w-80 mx-auto">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default UserStatusChart;
