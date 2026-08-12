import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useQuizPerformanceTrends } from '../hooks/useInstructorDashboard';

export const QuizPerformanceChart: React.FC = () => {
  const { data: trends, isLoading, isError } = useQuizPerformanceTrends();

  const categories = trends?.map((t) => t.category) || [];
  const avgScores = trends?.map((t) => t.averageScore) || [];
  const passRates = trends?.map((t) => t.passRate) || [];
  const hasData = categories.length > 0;

  const options: ApexOptions = {
    colors: ['#465fff', '#10b981'],
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'bar',
      height: 280,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '45%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 3,
      colors: ['transparent'],
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      max: 100,
      labels: {
        formatter: (val: number) => `${val}%`,
      },
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 4,
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
  };

  const series = [
    {
      name: 'Average Score (%)',
      data: avgScores,
    },
    {
      name: 'Pass Rate (%)',
      data: passRates,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Quiz Performance Analytics
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Average scores and passing percentage per subject category
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-sm text-gray-400">
          Loading performance data...
        </div>
      ) : isError ? (
        <div className="h-64 flex items-center justify-center text-sm text-rose-500">
          Failed to load quiz performance data.
        </div>
      ) : !hasData ? (
        <div className="h-64 flex items-center justify-center text-sm text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          No quiz performance data available yet.
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="-ml-3 min-w-[500px] xl:min-w-full">
            <Chart options={options} series={series} type="bar" height={280} />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPerformanceChart;
