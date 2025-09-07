import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Download, Filter, Edit, Save, Trash2, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  caseNumber: string;
  applicationType: string;
  typeOfStay: string;
  office: string;
  inspector: string;
  biometricsDate: string;
  decision: 'pending' | 'positive' | 'negative';
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  email: string;
  phone: string;
  dateOfBirth: string;
  postalCode: string;
  reviewDate: string;
  appeal: boolean;
  expediteRequest: boolean;
  paymentAmount?: string;
  notes: string;
}

const getDecisionBadge = (decision: Client['decision']) => {
  const variants = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    positive: 'bg-green-100 text-green-800 border-green-300',
    negative: 'bg-red-100 text-red-800 border-red-300'
  };
  
  const labels = {
    pending: 'Pending',
    positive: 'Positive',
    negative: 'Negative'
  };

  return (
    <Badge variant="outline" className={variants[decision]}>
      {labels[decision]}
    </Badge>
  );
};

const getPaymentBadge = (status: Client['paymentStatus']) => {
  const variants = {
    paid: 'bg-green-100 text-green-800 border-green-300',
    unpaid: 'bg-red-100 text-red-800 border-red-300',
    partial: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  };
  
  const labels = {
    paid: 'Paid',
    unpaid: 'Unpaid',
    partial: 'Partial'
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
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<string>('all');
  const [officeFilter, setOfficeFilter] = useState<string>('all');
  const [inspectorFilter, setInspectorFilter] = useState<string>('all');
  
  // New client form
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    postalCode: '',
    applicationType: '',
    typeOfStay: '',
    office: '',
    inspector: '',
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

        const formattedClients = users?.map((user, index) => ({
          id: user.id,
          name: `${user.first_name || 'Unknown'} ${user.last_name || 'User'}`.trim(),
          firstName: user.first_name || 'Unknown',
          lastName: user.last_name || 'User',
          caseNumber: user.cases?.[0]?.public_case_id || `CASE-${String(index + 1).padStart(4, '0')}`,
          applicationType: user.cases?.[0]?.category || 'Temporary Residence',
          typeOfStay: 'Work Permit',
          office: ['Warsaw Office', 'Krakow Office', 'Gdansk Office'][index % 3],
          inspector: ['Jan Kowalski', 'Anna Nowak', 'Piotr Zielinski'][index % 3],
          biometricsDate: '2025-02-15',
          decision: (user.cases?.[0]?.status === 'approved' ? 'positive' : 
                    user.cases?.[0]?.status === 'rejected' ? 'negative' : 'pending') as Client['decision'],
          paymentStatus: (['paid', 'unpaid', 'partial'] as const)[index % 3],
          email: user.email || 'No email provided',
          phone: '123-456-789',
          dateOfBirth: '1990-01-01',
          postalCode: '00-001',
          reviewDate: '2025-03-01',
          appeal: false,
          expediteRequest: false,
          paymentAmount: '1500 PLN',
          notes: 'Initial consultation completed. Awaiting document review.'
        })) || [];

        setClients(formattedClients);
        setFilteredClients(formattedClients);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setClients([]);
        setFilteredClients([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Filter and search effect
  useEffect(() => {
    let filtered = clients;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.caseNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply decision filter
    if (decisionFilter !== 'all') {
      filtered = filtered.filter(client => client.decision === decisionFilter);
    }

    // Apply office filter
    if (officeFilter !== 'all') {
      filtered = filtered.filter(client => client.office === officeFilter);
    }

    // Apply inspector filter
    if (inspectorFilter !== 'all') {
      filtered = filtered.filter(client => client.inspector === inspectorFilter);
    }

    setFilteredClients(filtered);
  }, [clients, searchQuery, decisionFilter, officeFilter, inspectorFilter]);

  const handleAddClient = async () => {
    if (!newClient.firstName.trim() || !newClient.lastName.trim() || !newClient.email.trim()) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          first_name: newClient.firstName.trim(),
          last_name: newClient.lastName.trim(),
          email: newClient.email.trim(),
          role: 'client',
          telegram_id: Math.floor(Math.random() * 1000000000),
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

      const formattedClient: Client = {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        firstName: data.first_name,
        lastName: data.last_name,
        caseNumber: `CASE-${String(clients.length + 1).padStart(4, '0')}`,
        applicationType: newClient.applicationType || 'Temporary Residence',
        typeOfStay: newClient.typeOfStay || 'Work Permit',
        office: newClient.office || 'Warsaw Office',
        inspector: newClient.inspector || 'Jan Kowalski',
        biometricsDate: '2025-02-15',
        decision: 'pending',
        paymentStatus: 'unpaid',
        email: data.email,
        phone: newClient.phone || '123-456-789',
        dateOfBirth: newClient.dateOfBirth || '1990-01-01',
        postalCode: newClient.postalCode || '00-001',
        reviewDate: '2025-03-01',
        appeal: false,
        expediteRequest: false,
        paymentAmount: '1500 PLN',
        notes: ''
      };

      setClients(prevClients => [formattedClient, ...prevClients]);
      setNewClient({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        postalCode: '',
        applicationType: '',
        typeOfStay: '',
        office: '',
        inspector: '',
      });
      setIsAddDialogOpen(false);
      alert('Client added successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSaveClient = async () => {
    if (!selectedClient) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: selectedClient.firstName,
          last_name: selectedClient.lastName,
          email: selectedClient.email,
        })
        .eq('id', selectedClient.id);

      if (error) throw error;

      setClients(prevClients =>
        prevClients.map(client =>
          client.id === selectedClient.id ? selectedClient : client
        )
      );
      
      setIsEditing(false);
      alert('Client updated successfully!');
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Error updating client. Please try again.');
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    
    if (!confirm(`Are you sure you want to delete client "${selectedClient.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedClient.id);

      if (error) {
        console.error('Database error:', error);
        alert(`Error deleting client: ${error.message}`);
        return;
      }

      setClients(prevClients => prevClients.filter(client => client.id !== selectedClient.id));
      setSelectedClient(null);
      alert('Client deleted successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleExport = () => {
    alert('Export functionality would generate CSV/Excel file of filtered clients');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDecisionFilter('all');
    setOfficeFilter('all');
    setInspectorFilter('all');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  // Client Detail View
  if (selectedClient) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedClient(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clients
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{selectedClient.name}</h1>
              <p className="text-muted-foreground">Case {selectedClient.caseNumber}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveClient}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={handleDeleteClient}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Client
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  {isEditing ? (
                    <Input
                      value={selectedClient.name}
                      onChange={(e) => setSelectedClient(prev => prev ? {...prev, name: e.target.value} : null)}
                    />
                  ) : (
                    <p className="font-medium">{selectedClient.name}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date of Birth (Data Urodzenia)</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={selectedClient.dateOfBirth}
                      onChange={(e) => setSelectedClient(prev => prev ? {...prev, dateOfBirth: e.target.value} : null)}
                    />
                  ) : (
                    <p>{selectedClient.dateOfBirth}</p>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Postal Code (Numer Pocztowy)</Label>
                {isEditing ? (
                  <Input
                    value={selectedClient.postalCode}
                    onChange={(e) => setSelectedClient(prev => prev ? {...prev, postalCode: e.target.value} : null)}
                  />
                ) : (
                  <p>{selectedClient.postalCode}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Case Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Case Number</Label>
                  <p className="font-medium">{selectedClient.caseNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Application Type (Wniosek)</Label>
                  <p>{selectedClient.applicationType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type of Stay (Pobyt)</Label>
                  <p>{selectedClient.typeOfStay}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Office (Urząd)</Label>
                  <p>{selectedClient.office}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Inspector</Label>
                  <p>{selectedClient.inspector}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Review Date (Data Rozpatrzenia)</Label>
                  <p>{selectedClient.reviewDate}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Biometrics Date (Data Odcisków)</Label>
                <p>{selectedClient.biometricsDate}</p>
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Decision (Decyzja)</Label>
                <div className="mt-1">{getDecisionBadge(selectedClient.decision)}</div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Appeal (Odwołanie)</Label>
                <Switch
                  checked={selectedClient.appeal}
                  onCheckedChange={(checked) => setSelectedClient(prev => prev ? {...prev, appeal: checked} : null)}
                  disabled={!isEditing}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Expedite Request (Uskorenen)</Label>
                <Switch
                  checked={selectedClient.expediteRequest}
                  onCheckedChange={(checked) => setSelectedClient(prev => prev ? {...prev, expediteRequest: checked} : null)}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payments Card */}
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Payment Status (Wpłacono)</Label>
                <div className="mt-1">{getPaymentBadge(selectedClient.paymentStatus)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                {isEditing ? (
                  <Input
                    value={selectedClient.paymentAmount || ''}
                    onChange={(e) => setSelectedClient(prev => prev ? {...prev, paymentAmount: e.target.value} : null)}
                  />
                ) : (
                  <p>{selectedClient.paymentAmount}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={selectedClient.notes}
                  onChange={(e) => setSelectedClient(prev => prev ? {...prev, notes: e.target.value} : null)}
                  rows={4}
                  placeholder="Add notes about this client..."
                />
              ) : (
                <p className="text-sm">{selectedClient.notes || 'No notes available.'}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage your client cases and information</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
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
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name..."
                      value={newClient.firstName}
                      onChange={(e) => setNewClient(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name..."
                      value={newClient.lastName}
                      onChange={(e) => setNewClient(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="Enter phone number..."
                      value={newClient.phone}
                      onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={newClient.dateOfBirth}
                      onChange={(e) => setNewClient(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      placeholder="Enter postal code..."
                      value={newClient.postalCode}
                      onChange={(e) => setNewClient(prev => ({ ...prev, postalCode: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="applicationType">Application Type</Label>
                    <Select value={newClient.applicationType} onValueChange={(value) => setNewClient(prev => ({ ...prev, applicationType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select application type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Temporary Residence">Temporary Residence</SelectItem>
                        <SelectItem value="Permanent Residence">Permanent Residence</SelectItem>
                        <SelectItem value="Work Permit">Work Permit</SelectItem>
                        <SelectItem value="EU Blue Card">EU Blue Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="typeOfStay">Type of Stay</Label>
                    <Select value={newClient.typeOfStay} onValueChange={(value) => setNewClient(prev => ({ ...prev, typeOfStay: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type of stay" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Work Permit">Work Permit</SelectItem>
                        <SelectItem value="Student Visa">Student Visa</SelectItem>
                        <SelectItem value="Family Reunification">Family Reunification</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="office">Office</Label>
                    <Select value={newClient.office} onValueChange={(value) => setNewClient(prev => ({ ...prev, office: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select office" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Warsaw Office">Warsaw Office</SelectItem>
                        <SelectItem value="Krakow Office">Krakow Office</SelectItem>
                        <SelectItem value="Gdansk Office">Gdansk Office</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="inspector">Inspector</Label>
                    <Select value={newClient.inspector} onValueChange={(value) => setNewClient(prev => ({ ...prev, inspector: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select inspector" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Jan Kowalski">Jan Kowalski</SelectItem>
                        <SelectItem value="Anna Nowak">Anna Nowak</SelectItem>
                        <SelectItem value="Piotr Zielinski">Piotr Zielinski</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddClient}
                    disabled={!newClient.firstName.trim() || !newClient.lastName.trim() || !newClient.email.trim()}
                  >
                    Add Client
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name or case number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={decisionFilter} onValueChange={setDecisionFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Decisions</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>

              <Select value={officeFilter} onValueChange={setOfficeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Office" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Offices</SelectItem>
                  <SelectItem value="Warsaw Office">Warsaw</SelectItem>
                  <SelectItem value="Krakow Office">Krakow</SelectItem>
                  <SelectItem value="Gdansk Office">Gdansk</SelectItem>
                </SelectContent>
              </Select>

              <Select value={inspectorFilter} onValueChange={setInspectorFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Inspector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Inspectors</SelectItem>
                  <SelectItem value="Jan Kowalski">Jan Kowalski</SelectItem>
                  <SelectItem value="Anna Nowak">Anna Nowak</SelectItem>
                  <SelectItem value="Piotr Zielinski">Piotr Zielinski</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name (Imię + Nazwisko)</TableHead>
                <TableHead>Case Number</TableHead>
                <TableHead>Application Type (Wniosek)</TableHead>
                <TableHead>Type of Stay (Pobyt)</TableHead>
                <TableHead>Office (Urząd)</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Biometrics Date (Data Odcisków)</TableHead>
                <TableHead>Decision (Decyzja)</TableHead>
                <TableHead>Payment Status (Wpłacono)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedClient(client)}
                >
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.caseNumber}</TableCell>
                  <TableCell>{client.applicationType}</TableCell>
                  <TableCell>{client.typeOfStay}</TableCell>
                  <TableCell>{client.office}</TableCell>
                  <TableCell>{client.inspector}</TableCell>
                  <TableCell>{client.biometricsDate}</TableCell>
                  <TableCell>{getDecisionBadge(client.decision)}</TableCell>
                  <TableCell>{getPaymentBadge(client.paymentStatus)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredClients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No clients found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Clients;