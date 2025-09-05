import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: number;
  clientName: string;
  question: string;
  dateSubmitted: string;
  status: 'open' | 'answered' | 'pending';
  language?: string;
  answer?: string;
}

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select(`
            *,
            users!questions_user_id_fkey (
              first_name,
              last_name
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedQuestions = data.map(q => ({
            id: q.id,
            clientName: `${q.users?.first_name || 'Unknown'} ${q.users?.last_name || 'User'}`.trim(),
            question: q.text,
            dateSubmitted: q.created_at?.split('T')[0] || '2025-01-01',
            status: (q.status === 'new' ? 'open' : 
                    q.status === 'answered' ? 'answered' : 'pending') as Question['status'],
            language: q.lang || 'English',
            answer: q.answer
          }));
          setQuestions(formattedQuestions);
        } else {
          // Fallback data if no questions in database
          setQuestions([
            {
              id: 1,
              clientName: 'Demo User',
              question: 'When will my student visa Karta Pobytu be ready? I submitted all documents last month.',
              dateSubmitted: '2025-01-09',
              status: 'open',
              language: 'English'
            },
            {
              id: 2,
              clientName: 'Sample Client',
              question: 'Can I travel abroad while waiting for the decision? I have urgent business travel.',
              dateSubmitted: '2025-01-08',
              status: 'open',
              language: 'English'
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        // Keep fallback data on error
        setQuestions([
          {
            id: 1,
            clientName: 'Demo User',
            question: 'When will my student visa Karta Pobytu be ready?',
            dateSubmitted: '2025-01-09',
            status: 'open',
            language: 'English'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleSendResponse = async () => {
    if (!selectedQuestion || !answer.trim()) {
      alert('Please enter a response');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Sending response for question:', selectedQuestion.id);
      
      const { error } = await supabase
        .from('questions')
        .update({
          answer: answer.trim(),
          status: 'answered',
          answered_at: new Date().toISOString(),
          answered_by: 1 // This would be the current user's ID in a real app
        })
        .eq('id', selectedQuestion.id);

      if (error) {
        console.error('Database error:', error);
        alert(`Error sending response: ${error.message}`);
        return;
      }

      console.log('Response sent successfully');

      // Update local state
      setQuestions(prevQuestions => 
        prevQuestions.map(q => 
          q.id === selectedQuestion.id 
            ? { ...q, status: 'answered' as const, answer: answer.trim() }
            : q
        )
      );

      // Update selected question
      setSelectedQuestion({
        ...selectedQuestion,
        status: 'answered',
        answer: answer.trim()
      });

      // Clear the answer input
      setAnswer('');
      
      alert('Response sent successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

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
                <p className="text-sm font-medium text-muted-foreground">Language</p>
                <p>{selectedQuestion.language || 'English'}</p>
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
                <Button 
                  className="bg-gradient-primary hover:opacity-90"
                  onClick={handleSendResponse}
                  disabled={!answer.trim() || isSubmitting}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Sending...' : 'Send Response'}
                </Button>
                <Button variant="outline">
                  Save Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Previous Responses */}
        {selectedQuestion.status === 'answered' && selectedQuestion.answer && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-primary">Previous Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Your Response</p>
                    <p className="text-xs text-muted-foreground">{selectedQuestion.dateSubmitted}</p>
                  </div>
                  <p className="text-sm">{selectedQuestion.answer}</p>
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
                {questions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No questions found
                    </td>
                  </tr>
                ) : (
                  questions.map((question) => (
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

export default ClientQuestions;
