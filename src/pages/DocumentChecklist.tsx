import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';

interface Document {
  id: number | string;
  name: string;
  category: 'Identity' | 'Work' | 'Housing' | 'Financial' | 'Education' | 'Process';
  required: boolean;
  description?: string;
  process_name?: string;
}

const getCategoryBadge = (category: Document['category']) => {
  const variants = {
    Identity: 'bg-primary/10 text-primary border-primary/20',
    Work: 'bg-success/10 text-success border-success/20',
    Housing: 'bg-accent/10 text-accent border-accent/20',
    Financial: 'bg-warning/10 text-warning border-warning/20',
    Education: 'bg-destructive/10 text-destructive border-destructive/20',
    Process: 'bg-muted/10 text-muted-foreground border-muted/20'
  };

  return (
    <Badge variant="outline" className={variants[category]}>
      {category}
    </Badge>
  );
};

const DocumentChecklist = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: '',
    category: 'Identity' as Document['category'],
    required: true,
    description: ''
  });

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from('processes')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          // Transform processes into document requirements
          const processDocuments = data.flatMap(process => 
            process.required_documents?.map((doc: string, index: number) => ({
              id: `${process.id}-${index}`,
              name: doc,
              category: 'Process' as const,
              required: true,
              description: `Required for: ${process.name}`,
              process_name: process.name
            })) || []
          );
          setDocuments(processDocuments);
        } else {
          // Fallback data if no processes in database
          setDocuments([
            { id: 1, name: 'Passport', category: 'Identity', required: true, description: 'Valid passport with at least 6 months remaining validity' },
            { id: 2, name: 'Employment Contract', category: 'Work', required: true, description: 'Signed employment contract or job offer letter' },
            { id: 3, name: 'Rental Agreement', category: 'Housing', required: true, description: 'Rental contract or proof of accommodation' },
            { id: 4, name: 'Proof of Income', category: 'Financial', required: true, description: 'Bank statements or salary slips for last 3 months' },
            { id: 5, name: 'Health Insurance', category: 'Financial', required: true, description: 'Valid health insurance coverage in Poland' },
            { id: 6, name: 'Diploma', category: 'Education', required: false, description: 'Educational certificates (if applicable)' },
            { id: 7, name: 'Marriage Certificate', category: 'Identity', required: false, description: 'Marriage certificate (for family reunification)' },
            { id: 8, name: 'Birth Certificate', category: 'Identity', required: false, description: 'Birth certificate of children (if applicable)' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching document requirements:', error);
        // Keep fallback data on error
        setDocuments([
          { id: 1, name: 'Passport', category: 'Identity', required: true, description: 'Valid passport with at least 6 months remaining validity' },
          { id: 2, name: 'Employment Contract', category: 'Work', required: true, description: 'Signed employment contract or job offer letter' },
          { id: 3, name: 'Rental Agreement', category: 'Housing', required: true, description: 'Rental contract or proof of accommodation' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleAddDocument = async () => {
    if (!newDocument.name.trim()) {
      alert('Please enter a document name');
      return;
    }

    try {
      console.log('Adding new document requirement:', newDocument);
      
      // Create a new process entry with this document requirement
      const { data, error } = await supabase
        .from('processes')
        .insert([{
          name: `${newDocument.name} Process`,
          description: newDocument.description || `Process for ${newDocument.name}`,
          required_documents: [newDocument.name],
          estimated_duration_days: 30,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        alert(`Error adding document: ${error.message}`);
        return;
      }

      console.log('Document requirement added successfully:', data);

      // Add the new document to local state
      const formattedDocument: Document = {
        id: `${data.id}-0`,
        name: newDocument.name,
        category: newDocument.category,
        required: newDocument.required,
        description: newDocument.description || `Required for: ${data.name}`,
        process_name: data.name
      };

      setDocuments(prevDocs => [formattedDocument, ...prevDocs]);

      // Reset form and close dialog
      setNewDocument({
        name: '',
        category: 'Identity',
        required: true,
        description: ''
      });
      setIsAddDialogOpen(false);

      alert('Document requirement added successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const requiredDocs = documents.filter(doc => doc.required);
  const optionalDocs = documents.filter(doc => !doc.required);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading document checklist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Document Checklist</h1>
          <p className="text-muted-foreground">Manage required documents for Karta Pobytu applications</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Document Requirement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="document_name">Document Name *</Label>
                <Input
                  id="document_name"
                  placeholder="e.g., Birth Certificate, Bank Statement..."
                  value={newDocument.name}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this document is for and any specific requirements..."
                  value={newDocument.description}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newDocument.category} 
                    onValueChange={(value: Document['category']) => setNewDocument(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Identity">Identity</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Housing">Housing</SelectItem>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="required"
                    checked={newDocument.required}
                    onCheckedChange={(checked) => setNewDocument(prev => ({ ...prev, required: !!checked }))}
                  />
                  <Label htmlFor="required" className="text-sm font-medium">
                    Required document
                  </Label>
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
                  onClick={handleAddDocument}
                  disabled={!newDocument.name.trim()}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  Add Document
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{documents.length}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{requiredDocs.length}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Optional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{optionalDocs.length}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {new Set(documents.map(d => d.category)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Required Documents */}
      {requiredDocs.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Required Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left p-4 font-semibold text-primary">Document Name</th>
                    <th className="text-left p-4 font-semibold text-primary">Category</th>
                    <th className="text-left p-4 font-semibold text-primary">Description</th>
                    <th className="text-left p-4 font-semibold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requiredDocs.map((doc) => (
                    <tr key={doc.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="font-medium flex items-center">
                          <div className="w-2 h-2 bg-destructive rounded-full mr-3" />
                          {doc.name}
                        </div>
                      </td>
                      <td className="p-4">
                        {getCategoryBadge(doc.category)}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-muted-foreground max-w-md">
                          {doc.description || 'No description provided'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optional Documents */}
      {optionalDocs.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Optional Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left p-4 font-semibold text-primary">Document Name</th>
                    <th className="text-left p-4 font-semibold text-primary">Category</th>
                    <th className="text-left p-4 font-semibold text-primary">Description</th>
                    <th className="text-left p-4 font-semibold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {optionalDocs.map((doc) => (
                    <tr key={doc.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="font-medium flex items-center">
                          <div className="w-2 h-2 bg-success rounded-full mr-3" />
                          {doc.name}
                        </div>
                      </td>
                      <td className="p-4">
                        {getCategoryBadge(doc.category)}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-muted-foreground max-w-md">
                          {doc.description || 'No description provided'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No documents message */}
      {documents.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No document requirements found</p>
            <p className="text-sm text-muted-foreground mt-2">Add processes with required documents to populate this checklist</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentChecklist;
