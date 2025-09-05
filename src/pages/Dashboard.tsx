import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, FileText, TrendingUp } from 'lucide-react';

const stats = [
  {
    name: 'Active Users',
    value: '42',
    change: '+4.75%',
    icon: Users,
    color: 'text-accent'
  },
  {
    name: 'Incoming Questions',
    value: '7',
    change: '+54.02%',
    icon: MessageSquare,
    color: 'text-primary'
  },
  {
    name: 'Submitted Documents',
    value: '15',
    change: '+12.06%',
    icon: FileText,
    color: 'text-success'
  }
];

const recentActivities = [
  {
    id: 1,
    message: 'John Doe uploaded Passport.pdf',
    time: '2 minutes ago',
    type: 'document'
  },
  {
    id: 2,
    message: 'Anna Kowalska asked a question about deadlines',
    time: '15 minutes ago',
    type: 'question'
  },
  {
    id: 3,
    message: 'Client #32 submitted Rental Agreement',
    time: '1 hour ago',
    type: 'document'
  },
  {
    id: 4,
    message: 'Maria Ivanova\'s Karta Pobytu was approved',
    time: '2 hours ago',
    type: 'approval'
  },
  {
    id: 5,
    message: 'New client registration: Pavel Novak',
    time: '3 hours ago',
    type: 'client'
  }
];

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your legal case management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="flex items-center space-x-2 text-xs text-success">
                  <TrendingUp className="w-3 h-3" />
                  <span>{stat.change}</span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activities */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-primary">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'document' ? 'bg-primary' :
                  activity.type === 'question' ? 'bg-accent' :
                  activity.type === 'approval' ? 'bg-success' :
                  'bg-muted-foreground'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;