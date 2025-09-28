interface StatsCardsProps {
  stats?: {
    totalCollections: number;
    totalExpenses: number;
    activeCustomers: number;
    pendingBills: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Collections",
      value: `₹${stats?.totalCollections.toLocaleString() || '0'}`,
      icon: "fas fa-arrow-up",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: "+12.5% from last month",
      changeColor: "text-green-600",
      testId: "card-total-collections"
    },
    {
      title: "Total Expenses",
      value: `₹${stats?.totalExpenses.toLocaleString() || '0'}`,
      icon: "fas fa-arrow-down",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      change: "+5.2% from last month",
      changeColor: "text-red-600",
      testId: "card-total-expenses"
    },
    {
      title: "Active Customers",
      value: stats?.activeCustomers.toString() || '0',
      icon: "fas fa-users",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      change: "+8 new this month",
      changeColor: "text-blue-600",
      testId: "card-active-customers"
    },
    {
      title: "Pending Bills",
      value: stats?.pendingBills.toString() || '0',
      icon: "fas fa-clock",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      change: "Due this week",
      changeColor: "text-yellow-600",
      testId: "card-pending-bills"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div key={card.testId} className="bg-card p-6 rounded-xl shadow-sm border border-border" data-testid={card.testId}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{card.title}</p>
              <p className="text-2xl font-bold text-foreground" data-testid={`${card.testId}-value`}>
                {card.value}
              </p>
            </div>
            <div className={`${card.iconBg} p-3 rounded-full`}>
              <i className={`${card.icon} ${card.iconColor}`}></i>
            </div>
          </div>
          <div className="mt-4">
            <span className={`${card.changeColor} text-sm`}>{card.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
