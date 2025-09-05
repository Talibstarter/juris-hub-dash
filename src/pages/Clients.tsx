import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  caseStatus: 'pending' | 'in-progress' | 'approved' | 'rejected';
  email: string;
  phone: string;
  lastActivity: string;
}

const clients: Client[] = [
  {
    id: 1,
    name: 'John Doe',
    caseStatus: 'in-progress',
    email: 'john.doe@email.com',
    phone: '+48 123 456 789',
    lastActivity: '2 days ago'
  },
  {
    id: 2,
    name: 'Anna Kowalska',
    caseStatus: 'pending',
    email: 'anna.kowalska@email.com',
    phone: '+48 987 654 321',
    lastActivity: '1 day ago'
  },
  {
    id: 3,
    name: 'Maria Ivanova',
    caseStatus: 'approved',
    email: 'maria.ivanova@email.com',
    phone: '+48 555 777 999',
    lastActivity: '5 days ago'
  },
  {
    id: 4,
    name: 'Pavel Novak',
    caseStatus: 'in-progress',
    email: 'pavel.novak@email.com',
    phone: '+48 333 222 111',
    lastActivity: '3 hours ago'
  }
];

const getStatusBadge = (status: Client['caseStatus']) => {
  const variants = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    'in-progress': 'bg-primary/10 text-primary border-primary/20',
    approved: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20'
  };
  
  const labels = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    approved: 'Approved',
    rejected: 'Rejected'
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {labels[status]}
    </Badge>
  );
};

const Clients = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  if (selectedClient) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Client Profile</h1>
            <p className="text-muted-foreground">Detailed view of client information</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedClient(null)}>
            Back to Clients
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Details */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-primary">Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{selectedClient.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{selectedClient.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p>{selectedClient.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Case Details */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-primary">Case Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(selectedClient.caseStatus)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deadline</p>
                <p>March 15, 2025</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Case Type</p>
                <p>Karta Pobytu Application</p>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Documents */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-primary">Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>No documents uploaded yet.</p>
                <p className="text-sm">Documents will appear here once uploaded.</p>
              </div>
            </CardContent>
          </Card>

          {/* Communication Log */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-primary">Communication Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Initial consultation completed</p>
                  <p className="text-xs text-muted-foreground">January 15, 2025</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Document checklist sent to client</p>
                  <p className="text-xs text-muted-foreground">January 20, 2025</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Clients</h1>
        <p className="text-muted-foreground">Manage your client cases and information</p>
      </div>

      {/* Clients Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left p-4 font-semibold text-primary">Name</th>
                  <th className="text-left p-4 font-semibold text-primary">Case Status</th>
                  <th className="text-left p-4 font-semibold text-primary">Contact Info</th>
                  <th className="text-left p-4 font-semibold text-primary">Last Activity</th>
                  <th className="text-left p-4 font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{client.name}</div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(client.caseStatus)}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-sm">{client.email}</div>
                        <div className="text-sm text-muted-foreground">{client.phone}</div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{client.lastActivity}</td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedClient(client)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clients;