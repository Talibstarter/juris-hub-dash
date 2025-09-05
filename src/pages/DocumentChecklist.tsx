import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
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
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </Button>
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
