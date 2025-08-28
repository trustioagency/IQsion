import React from "react";
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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WidgetChartProps {
  data: Array<{ date: string; value: number }>;
  label: string;
}

const WidgetChart: React.FC<WidgetChartProps> = ({ data, label }) => {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label,
        data: data.map((d) => d.value),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false } },
    },
  };

  return (
    <div className="w-full h-40">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default WidgetChart;
