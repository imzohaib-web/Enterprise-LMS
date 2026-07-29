import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useEnrollmentTrends } from '../hooks/useInstructorDashboard';

export const EnrollmentChart: React.FC = () => {
  const { data: trends, isLoading } = useEnrollmentTrends();

  const categories = trends?.map((t) => t.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const seriesData = trends?.map((t) => t.enrollments) || [120, 185, 240, 310, 290, 380, 450];

  const options: ApexOptions = {
    colors: ['#465fff'],
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'area',
      height: 280,
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${Math.round(val)}`,
      },
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 4,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} Students Enrolled`,
      },
    },
  };

  const series = [
    {
      name: 'Enrollments',
      data: seriesData,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Student Enrollments Trend
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Monthly student registration growth across all courses
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-sm text-gray-400">
          Loading chart data...
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="-ml-3 min-w-[500px] xl:min-w-full">
            <Chart options={options} series={series} type="area" height={280} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentChart;
