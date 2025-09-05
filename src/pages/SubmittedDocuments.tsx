import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, X, FileText, AlertCircle } from 'lucide-react';

interface SubmittedDocument {
  id: number;
  clientName: string;
  documentName: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  fileSize?: string;
  notes?: string;
}

const documents: SubmittedDocument[] = [
  {
    id: 1,
    clientName: 'John Doe',
    documentName: 'Passport.pdf',
    uploadDate: '01/09/2025',
    status: 'pending',
    fileSize: '2.3 MB'
  },
  {
    id: 2,
    clientName: 'Anna Kowalska',
    documentName: 'RentalAgreement.pdf',
    uploadDate: '02/09/2025',
    status: 'approved',
    fileSize: '1.8 MB'
  },
  {
    id: 3,
    clientName: 'Maria Ivanova',
    documentName: 'EmploymentContract.pdf',
    uploadDate: '03/09/2025',
    status: 'rejected',
    fileSize: '1.2 MB',
    notes: 'Document is not clearly visible, please re-upload'
  },
  {
    id: 4,
    clientName: 'Pavel Novak',
    documentName: 'HealthInsurance.pdf',
    uploadDate: '04/09/2025',
    status: 'approved',
    fileSize: '3.1 MB'
  },
  {
    id: 5,
    clientName: 'Elena Rodriguez',
    documentName: 'ProofOfIncome.pdf',
    uploadDate: '05/09/2025',
    status: 'pending',
    fileSize: '2.7 MB'
  },
  {
    id: 6,
    clientName: 'John Doe',
    documentName: 'BankStatement.pdf',
    uploadDate: '06/09/2025',
    status: 'pending',
    fileSize: '4.2 MB'
  }
];

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

  const handleApprove = (doc: SubmittedDocument) => {
    // Placeholder for approval logic
    console.log('Approved document:', doc);
  };

  const handleReject = (doc: SubmittedDocument) => {
    setRejectDialog(doc);
  };

  const confirmReject = () => {
    if (rejectDialog && rejectionReason.trim()) {
      // Placeholder for rejection logic
      console.log('Rejected document:', rejectDialog, 'Reason:', rejectionReason);
      setRejectDialog(null);
      setRejectionReason('');
    }
  };

  const pendingDocs = documents.filter(doc => doc.status === 'pending');
  const approvedDocs = documents.filter(doc => doc.status === 'approved');
  const rejectedDocs = documents.filter(doc => doc.status === 'rejected');

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
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{doc.clientName}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">{doc.documentName}</div>
                          <div className="text-xs text-muted-foreground">{doc.fileSize}</div>
                        </div>
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
                ))}
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