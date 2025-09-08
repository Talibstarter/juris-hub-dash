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
  paymentStatus: 'paid' | 'unpaid' | 'partial' | 'no';
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
    partial: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    no: 'bg-gray-100 text-gray-800 border-gray-300'
  };
  
  const labels = {
    paid: 'Paid',
    unpaid: 'Unpaid',
    partial: 'Partial',
    no: 'No Payment'
  };

  return (
    <Badge variant="outline" className={variants[status as keyof typeof variants] || variants.no}>
      {labels[status as keyof typeof labels] || labels.no}
    </Badge>
  );
};

const Clients = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [originalClient, setOriginalClient] = useState<Client | null>(null);
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
    telegramUsername: '',
    telegramNumber: '',
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
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedClients = data?.map(caseData => ({
          id: caseData.id,
          name: caseData.client_name || 'N/A',
          firstName: caseData.client_name?.split(' ')[0] || '',
          lastName: caseData.client_name?.split(' ').slice(1).join(' ') || '',
          caseNumber: caseData.public_case_id || `CASE-${caseData.id}`,
          applicationType: caseData.application_type || 'N/A',
          typeOfStay: caseData.type_of_stay || 'N/A',
          office: caseData.office || 'N/A',
          inspector: caseData.inspector || 'N/A',
          biometricsDate: caseData.biometrics_date || 'N/A',
          decision: (caseData.decision || 'pending') as Client['decision'],
          paymentStatus: (caseData.payment_status || 'no') as Client['paymentStatus'],
          email: 'N/A',
          phone: caseData.phone_e164 || 'N/A',
          dateOfBirth: caseData.date_of_birth || 'N/A',
          postalCode: caseData.postal_code || 'N/A',
          reviewDate: caseData.review_date || 'N/A',
          appeal: caseData.appeal || false,
          expediteRequest: caseData.expedite_request || false,
          paymentAmount: caseData.payment_amount ? `${caseData.payment_amount} PLN` : 'N/A',
          notes: caseData.notes || ''
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

  // Add refresh button functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isEditing) {
        refreshClients();
      }
    }, 30000); // Refresh every 30 seconds when not editing

    return () => clearInterval(interval);
  }, [isEditing]);

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
      // Create a new case record directly
      const { data, error } = await supabase
        .from('cases')
        .insert([{
          client_name: `${newClient.firstName.trim()} ${newClient.lastName.trim()}`,
          public_case_id: `CASE-${Date.now()}`,
          application_type: newClient.applicationType || null,
          type_of_stay: newClient.typeOfStay || null,
          office: newClient.office || null,
          inspector: newClient.inspector || null,
          date_of_birth: newClient.dateOfBirth || null,
          postal_code: newClient.postalCode || null,
          phone_e164: newClient.phone || null,
          decision: 'pending',
          payment_status: 'no',
          appeal: false,
          expedite_request: false,
          status: 'new',
          category: 'other',
          active: true
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
        name: data.client_name,
        firstName: data.client_name.split(' ')[0],
        lastName: data.client_name.split(' ').slice(1).join(' '),
        caseNumber: data.public_case_id,
        applicationType: data.application_type || 'N/A',
        typeOfStay: data.type_of_stay || 'N/A',
        office: data.office || 'N/A',
        inspector: data.inspector || 'N/A',
        biometricsDate: data.biometrics_date || 'N/A',
        decision: data.decision as Client['decision'],
        paymentStatus: data.payment_status as Client['paymentStatus'],
        email: newClient.email,
        phone: data.phone_e164 || newClient.phone || 'N/A',
        dateOfBirth: data.date_of_birth || newClient.dateOfBirth || 'N/A',
        postalCode: data.postal_code || newClient.postalCode || 'N/A',
        reviewDate: data.review_date || 'N/A',
        appeal: data.appeal,
        expediteRequest: data.expedite_request,
        paymentAmount: data.payment_amount ? `${data.payment_amount} PLN` : 'N/A',
        notes: data.notes || ''
      };

      setClients(prevClients => [formattedClient, ...prevClients]);
      setNewClient({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        telegramUsername: '',
        telegramNumber: '',
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

  const refreshClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedClients = data?.map(caseData => ({
        id: caseData.id,
        name: caseData.client_name || 'N/A',
        firstName: caseData.client_name?.split(' ')[0] || '',
        lastName: caseData.client_name?.split(' ').slice(1).join(' ') || '',
        caseNumber: caseData.public_case_id || `CASE-${caseData.id}`,
        applicationType: caseData.application_type || 'N/A',
        typeOfStay: caseData.type_of_stay || 'N/A',
        office: caseData.office || 'N/A',
        inspector: caseData.inspector || 'N/A',
        biometricsDate: caseData.biometrics_date || 'N/A',
        decision: (caseData.decision || 'pending') as Client['decision'],
        paymentStatus: (caseData.payment_status || 'no') as Client['paymentStatus'],
        email: 'N/A',
        phone: caseData.phone_e164 || 'N/A',
        dateOfBirth: caseData.date_of_birth || 'N/A',
        postalCode: caseData.postal_code || 'N/A',
        reviewDate: caseData.review_date || 'N/A',
        appeal: caseData.appeal || false,
        expediteRequest: caseData.expedite_request || false,
        paymentAmount: caseData.payment_amount ? `${caseData.payment_amount} PLN` : 'N/A',
        notes: caseData.notes || ''
      })) || [];

      setClients(formattedClients);
      setFilteredClients(formattedClients);

      // Update selected client if it exists
      if (selectedClient) {
        const updatedSelectedClient = formattedClients.find(client => client.id === selectedClient.id);
        if (updatedSelectedClient) {
          setSelectedClient(updatedSelectedClient);
        }
      }
    } catch (error) {
      console.error('Error refreshing clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChangedFields = (original: Client, current: Client) => {
    const changes: any = {};
    
    // Map client fields to database column names and compare
    const fieldMappings = {
      name: 'client_name',
      applicationType: 'application_type',
      typeOfStay: 'type_of_stay',
      office: 'office',
      inspector: 'inspector',
      biometricsDate: 'biometrics_date',
      decision: 'decision',
      paymentStatus: 'payment_status',
      reviewDate: 'review_date',
      appeal: 'appeal',
      expediteRequest: 'expedite_request',
      dateOfBirth: 'date_of_birth',
      postalCode: 'postal_code',
      notes: 'notes'
    };

    // Check each field for changes
    Object.entries(fieldMappings).forEach(([clientField, dbField]) => {
      const originalValue = original[clientField as keyof Client];
      const currentValue = current[clientField as keyof Client];
      
      if (originalValue !== currentValue) {
        if (clientField === 'paymentAmount') {
          // Handle payment amount conversion
          const originalAmount = originalValue === 'N/A' ? null : parseFloat(String(originalValue).replace(' PLN', ''));
          const currentAmount = currentValue === 'N/A' ? null : parseFloat(String(currentValue).replace(' PLN', ''));
          if (originalAmount !== currentAmount) {
            changes.payment_amount = currentAmount;
          }
        } else {
          // Handle null/N/A values
          const dbValue = currentValue === 'N/A' ? null : currentValue;
          changes[dbField] = dbValue;
        }
      }
    });

    // Special handling for payment amount
    if (original.paymentAmount !== current.paymentAmount) {
      const currentAmount = current.paymentAmount === 'N/A' ? null : parseFloat(String(current.paymentAmount).replace(' PLN', ''));
      changes.payment_amount = currentAmount;
    }

    return changes;
  };

  const handleSaveClient = async () => {
    if (!selectedClient || !originalClient) return;

    try {
      // Get only the changed fields
      const changedFields = getChangedFields(originalClient, selectedClient);
      
      // If no fields changed, just exit edit mode
      if (Object.keys(changedFields).length === 0) {
        setIsEditing(false);
        setOriginalClient(null);
        alert('No changes to save.');
        return;
      }

      console.log('Updating only changed fields:', changedFields);

      const { error } = await supabase
        .from('cases')
        .update(changedFields)
        .eq('id', selectedClient.id);

      if (error) throw error;

      // Refresh data from database to ensure synchronization
      await refreshClients();
      
      setIsEditing(false);
      setOriginalClient(null);
      alert(`Client updated successfully! Updated ${Object.keys(changedFields).length} field(s).`);
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
        .from('cases')
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
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  setOriginalClient(null);
                  // Reset to original data
                  if (originalClient) {
                    setSelectedClient(originalClient);
                  }
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSaveClient}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setIsEditing(true);
                  // Store original data when editing starts
                  setOriginalClient(selectedClient ? {...selectedClient} : null);
                }}>
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
                {isEditing ? (
                  <Select 
                    value={selectedClient.decision} 
                    onValueChange={(value: Client['decision']) => setSelectedClient(prev => prev ? {...prev, decision: value} : null)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1">{getDecisionBadge(selectedClient.decision)}</div>
                )}
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
                {isEditing ? (
                  <Select 
                    value={selectedClient.paymentStatus} 
                    onValueChange={(value: Client['paymentStatus']) => setSelectedClient(prev => prev ? {...prev, paymentStatus: value} : null)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No Payment</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1">{getPaymentBadge(selectedClient.paymentStatus)}</div>
                )}
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
                    <Label htmlFor="telegramUsername">Telegram User Name</Label>
                    <Input
                      id="telegramUsername"
                      placeholder="Enter telegram username..."
                      value={newClient.telegramUsername}
                      onChange={(e) => setNewClient(prev => ({ ...prev, telegramUsername: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telegramNumber">Telegram Number (Optional)</Label>
                    <Input
                      id="telegramNumber"
                      placeholder="Enter telegram number..."
                      value={newClient.telegramNumber}
                      onChange={(e) => setNewClient(prev => ({ ...prev, telegramNumber: e.target.value }))}
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