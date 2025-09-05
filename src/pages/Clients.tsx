import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: number;
  name: string;
  caseStatus: 'pending' | 'in-progress' | 'approved' | 'rejected';
  email: string;
  phone: string;
  lastActivity: string;
  case_id?: string;
  role?: string;
  telegram_id?: number;
}

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
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'client' as 'client' | 'lawyer',
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select(`
            *,
            cases (
              id,
              status,
              category,
              public_case_id,
              created_at,
              updated_at
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedClients = users?.map(user => ({
          id: user.id,
          name: `${user.first_name || 'Unknown'} ${user.last_name || 'User'}`.trim(),
          caseStatus: (user.cases?.[0]?.status === 'new' ? 'pending' : 
                     user.cases?.[0]?.status === 'in_review' ? 'in-progress' :
                     user.cases?.[0]?.status === 'approved' ? 'approved' :
                     user.cases?.[0]?.status === 'rejected' ? 'rejected' : 'pending') as Client['caseStatus'],
          email: user.email || 'No email provided',
          phone: 'Not provided',
          lastActivity: user.cases?.[0]?.updated_at?.split('T')[0] || user.created_at?.split('T')[0] || '2025-01-01',
          case_id: user.cases?.[0]?.public_case_id,
          role: user.role,
          telegram_id: user.telegram_id
        })) || [];

        setClients(formattedClients);
      } catch (error) {
        console.error('Error fetching clients:', error);
        // Fallback to empty array on error
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleAddClient = async () => {
    if (!newClient.first_name.trim() || !newClient.last_name.trim() || !newClient.email.trim()) {
      alert('Please fill in first name, last name, and email fields');
      return;
    }

    try {
      console.log('Adding new client:', newClient);
      
      const { data, error } = await supabase
        .from('users')
        .insert([{
          first_name: newClient.first_name.trim(),
          last_name: newClient.last_name.trim(),
          email: newClient.email.trim(),
          role: newClient.role,
          telegram_id: Math.floor(Math.random() * 1000000000), // Generate random telegram_id
          preferred_lang: 'en',
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        alert(`Error adding client: ${error.message}`);
        return;
      }

      console.log('Client added successfully:', data);

      // Add the new client to local state
      const formattedClient: Client = {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        caseStatus: 'pending',
        email: data.email,
        phone: 'Not provided',
        lastActivity: new Date().toISOString().split('T')[0],
        role: data.role
      };

      setClients(prevClients => [formattedClient, ...prevClients]);

      // Reset form and close dialog
      setNewClient({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'client'
      });
      setIsAddDialogOpen(false);

      alert('Client added successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteClient = async (clientId: number, clientName: string) => {
    if (!confirm(`Are you sure you want to delete client "${clientName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('Deleting client:', clientId);
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('Database error:', error);
        alert(`Error deleting client: ${error.message}`);
        return;
      }

      console.log('Client deleted successfully');

      // Remove client from local state
      setClients(prevClients => prevClients.filter(client => client.id !== clientId));

      alert('Client deleted successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

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
                <p className="text-sm font-medium text-muted-foreground">Case ID</p>
                <p>{selectedClient.case_id || 'No case assigned'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">User Role</p>
                <p className="capitalize">{selectedClient.role || 'Client'}</p>
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Clients</h1>
          <p className="text-muted-foreground">Manage your client cases and information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    placeholder="Enter first name..."
                    value={newClient.first_name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    placeholder="Enter last name..."
                    value={newClient.last_name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address..."
                  value={newClient.email}
                  onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number..."
                    value={newClient.phone}
                    onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={newClient.role} 
                    onValueChange={(value: 'client' | 'lawyer') => setNewClient(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="lawyer">Lawyer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddClient}
                  disabled={!newClient.first_name.trim() || !newClient.last_name.trim() || !newClient.email.trim()}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  Add Client
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No clients found
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
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
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedClient(client)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClient(client.id, client.name)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clients;