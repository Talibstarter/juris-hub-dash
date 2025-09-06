import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, X, FileText, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SubmittedDocument {
  id: number;
  clientName: string;
  documentName: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  fileSize?: string;
  notes?: string;
}

const getStatusBadge = (status: SubmittedDocument['status']) => {
  const variants = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    approved: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20'
  };
  
  const labels = {
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected'
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {labels[status]}
    </Badge>
  );
};

const SubmittedDocuments = () => {
  const [rejectDialog, setRejectDialog] = useState<SubmittedDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [documents, setDocuments] = useState<SubmittedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from('user_documents')
          .select(`
            *,
            documents (
              original_name,
              created_at,
              size_bytes
            ),
            cases (
              users (
                first_name,
                last_name
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedDocuments = data ? data.map(doc => ({
          id: doc.id,
          clientName: `${doc.cases?.users?.first_name || 'Unknown'} ${doc.cases?.users?.last_name || 'User'}`.trim(),
          documentName: doc.documents?.original_name || 'Unknown Document',
          uploadDate: doc.documents?.created_at?.split('T')[0] || doc.created_at?.split('T')[0] || '2025-01-01',
          status: (doc.status === 'pending' ? 'pending' : 
                   doc.status === 'approved' ? 'approved' : 
                   doc.status === 'rejected' ? 'rejected' : 'pending') as SubmittedDocument['status'],
          fileSize: doc.documents?.size_bytes ? `${(doc.documents.size_bytes / 1024 / 1024).toFixed(1)} MB` : undefined,
          notes: doc.comments
        })) : [];
        
        setDocuments(formattedDocuments);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleApprove = async (doc: SubmittedDocument) => {
    try {
      // Update document status in database
      const { error } = await supabase
        .from('user_documents')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewer_id: 1 // Using admin user ID for now
        })
        .eq('id', doc.id);

      if (error) throw error;

      // Update local state to reflect the change
      setDocuments(prevDocs => 
        prevDocs.map(d => 
          d.id === doc.id 
            ? { ...d, status: 'approved' as const }
            : d
        )
      );

      console.log('Document approved successfully:', doc.documentName);
    } catch (error) {
      console.error('Error approving document:', error);
    }
  };

  const handleReject = (doc: SubmittedDocument) => {
    setRejectDialog(doc);
  };

  const confirmReject = async () => {
    if (rejectDialog && rejectionReason.trim()) {
      try {
        // Update document status in database
        const { error } = await supabase
          .from('user_documents')
          .update({ 
            status: 'rejected',
            comments: rejectionReason,
            reviewed_at: new Date().toISOString(),
            reviewer_id: 1 // Using admin user ID for now
          })
          .eq('id', rejectDialog.id);

        if (error) throw error;

        // Update local state to reflect the change
        setDocuments(prevDocs => 
          prevDocs.map(d => 
            d.id === rejectDialog.id 
              ? { ...d, status: 'rejected' as const, notes: rejectionReason }
              : d
          )
        );

        console.log('Document rejected successfully:', rejectDialog.documentName);
        setRejectDialog(null);
        setRejectionReason('');
      } catch (error) {
        console.error('Error rejecting document:', error);
      }
    }
  };

  const handleOpenFile = (doc: SubmittedDocument) => {
    // For demo purposes, open a placeholder PDF in a new tab
    // In a real implementation, this would fetch the actual file URL from Supabase storage
    const fileUrl = `data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKCR7ZG9jLmRvY3VtZW50TmFtZX0pCi9Dcmv=`;
    
    // Create a temporary URL for demonstration
    const demoUrl = `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`;
    
    // Open file in new tab
    window.open(demoUrl, '_blank', 'noopener,noreferrer');
  };

  const pendingDocs = documents.filter(doc => doc.status === 'pending');
  const approvedDocs = documents.filter(doc => doc.status === 'approved');
  const rejectedDocs = documents.filter(doc => doc.status === 'rejected');

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Submitted Documents</h1>
        <p className="text-muted-foreground">Review and approve client submitted documents</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingDocs.length}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{approvedDocs.length}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{rejectedDocs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left p-4 font-semibold text-primary">Client Name</th>
                  <th className="text-left p-4 font-semibold text-primary">Document</th>
                  <th className="text-left p-4 font-semibold text-primary">Upload Date</th>
                  <th className="text-left p-4 font-semibold text-primary">Status</th>
                  <th className="text-left p-4 font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center space-y-3">
                        <FileText className="w-12 h-12 text-muted-foreground/50" />
                        <div>
                          <p className="font-medium">No documents submitted yet</p>
                          <p className="text-sm">Documents uploaded by users will appear here for review</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="font-medium">{doc.clientName}</div>
                      </td>
                      <td className="p-4">
                        <div 
                          className="flex items-center space-x-3 cursor-pointer hover:bg-muted/10 rounded-md p-2 -m-2 transition-colors group"
                          onClick={() => handleOpenFile(doc)}
                          title="Click to open file in new tab"
                        >
                          <FileText className="w-5 h-5 text-primary" />
                          <div className="flex-1">
                            <div className="font-medium">{doc.documentName}</div>
                            {doc.fileSize && (
                              <div className="text-xs text-muted-foreground">{doc.fileSize}</div>
                            )}
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{doc.uploadDate}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(doc.status)}
                          {doc.status === 'rejected' && doc.notes && (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="w-4 h-4 text-destructive" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{doc.notes}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {doc.status === 'pending' ? (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-success hover:text-success"
                              onClick={() => handleApprove(doc)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleReject(doc)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {doc.status === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{rejectDialog?.documentName}" from {rejectDialog?.clientName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for rejection</Label>
              <Input
                id="reason"
                placeholder="e.g., Document is not clearly visible, missing signature..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 justify-end">
              <Button variant="outline" onClick={() => setRejectDialog(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmReject}
                disabled={!rejectionReason.trim()}
              >
                Reject Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmittedDocuments;
