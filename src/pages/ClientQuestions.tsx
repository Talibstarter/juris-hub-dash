import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';

interface Question {
  id: number;
  clientName: string;
  question: string;
  dateSubmitted: string;
  status: 'open' | 'answered' | 'pending';
}

const questions: Question[] = [
  {
    id: 1,
    clientName: 'John Doe',
    question: 'When will my Karta Pobytu be ready? I submitted all documents last month.',
    dateSubmitted: '01/09/2025',
    status: 'open'
  },
  {
    id: 2,
    clientName: 'Maria Ivanova',
    question: 'Can I travel abroad while waiting for the decision? I have urgent business travel.',
    dateSubmitted: '02/09/2025',
    status: 'answered'
  },
  {
    id: 3,
    clientName: 'Anna Kowalska',
    question: 'Do I need to translate my birth certificate? The immigration office mentioned it.',
    dateSubmitted: '03/09/2025',
    status: 'pending'
  },
  {
    id: 4,
    clientName: 'Pavel Novak',
    question: 'My employment contract is ending soon. Will this affect my application?',
    dateSubmitted: '04/09/2025',
    status: 'open'
  },
  {
    id: 5,
    clientName: 'Elena Rodriguez',
    question: 'I received a letter from the immigration office asking for additional documents. What should I do?',
    dateSubmitted: '05/09/2025',
    status: 'open'
  }
];

const getStatusBadge = (status: Question['status']) => {
  const variants = {
    open: 'bg-destructive/10 text-destructive border-destructive/20',
    answered: 'bg-success/10 text-success border-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20'
  };
  
  const labels = {
    open: 'Open',
    answered: 'Answered',
    pending: 'Pending'
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {labels[status]}
    </Badge>
  );
};

const ClientQuestions = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');

  if (selectedQuestion) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => setSelectedQuestion(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Question Details</h1>
              <p className="text-muted-foreground">Respond to client inquiry</p>
            </div>
          </div>
          {getStatusBadge(selectedQuestion.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question Details */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-primary">Client Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Client</p>
                <p className="text-lg font-semibold">{selectedQuestion.clientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date Submitted</p>
                <p>{selectedQuestion.dateSubmitted}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Question</p>
                <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                  <p>{selectedQuestion.question}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Answer Form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-primary">Your Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Answer</p>
                <Textarea
                  placeholder="Type your response to the client's question..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button className="bg-gradient-primary hover:opacity-90">
                  <Send className="w-4 h-4 mr-2" />
                  Send Response
                </Button>
                <Button variant="outline">
                  Save Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Previous Responses */}
        {selectedQuestion.status === 'answered' && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-primary">Previous Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Your Response</p>
                    <p className="text-xs text-muted-foreground">02/09/2025 14:30</p>
                  </div>
                  <p className="text-sm">Yes, you can travel abroad with your current documents and the temporary residence stamp. Make sure to carry all your original documents when traveling.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Clients' Questions</h1>
        <p className="text-muted-foreground">Manage and respond to client inquiries</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {questions.filter(q => q.status === 'open').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {questions.filter(q => q.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Answered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {questions.filter(q => q.status === 'answered').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left p-4 font-semibold text-primary">Client Name</th>
                  <th className="text-left p-4 font-semibold text-primary">Question</th>
                  <th className="text-left p-4 font-semibold text-primary">Date Submitted</th>
                  <th className="text-left p-4 font-semibold text-primary">Status</th>
                  <th className="text-left p-4 font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{question.clientName}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm max-w-md truncate">
                        {question.question}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{question.dateSubmitted}</td>
                    <td className="p-4">
                      {getStatusBadge(question.status)}
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedQuestion(question)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {question.status === 'answered' ? 'View' : 'Answer'}
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

export default ClientQuestions;