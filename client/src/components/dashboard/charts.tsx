import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ChartsProps {
  stats?: {
    totalCollections: number;
    totalExpenses: number;
    customerStatusCounts: { paid: number; due: number; overdue: number };
  };
}

export default function Charts({ stats }: ChartsProps) {
  const paymentStatusData = {
    labels: ['Paid', 'Due', 'Free'],
    datasets: [{
      data: [
        stats?.customerStatusCounts.paid || 0,
        stats?.customerStatusCounts.due || 0,
        stats?.customerStatusCounts.overdue || 0
      ],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      borderWidth: 0
    }]
  };

  const paymentStatusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  };

  const financialData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Collections',
      data: [85000, 92000, 88000, 96000, 91000, stats?.totalCollections || 98000],
      backgroundColor: '#3B82F6'
    }, {
      label: 'Expenses',
      data: [35000, 42000, 38000, 45000, 41000, stats?.totalExpenses || 43000],
      backgroundColor: '#EF4444'
    }]
  };

  const financialOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Payment Status Distribution</h3>
        <div className="h-64" data-testid="chart-payment-status">
          <Doughnut data={paymentStatusData} options={paymentStatusOptions} />
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Collections vs Expenses</h3>
        <div className="h-64" data-testid="chart-financial">
          <Bar data={financialData} options={financialOptions} />
        </div>
      </div>
    </div>
  );
}
