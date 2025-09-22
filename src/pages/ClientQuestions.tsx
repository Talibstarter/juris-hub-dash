import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: number;
  clientName: string;
  question: string;
  dateSubmitted: string;
  status: 'open' | 'answered' | 'pending';
  language?: string;
  answer?: string;
  clientType: 'client' | 'non-client';
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
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [filter, setFilter] = useState<'all' | 'client' | 'non-client'>('all');
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data: questionsData, error } = await supabase
          .from('questions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (questionsData && questionsData.length > 0) {
          // Get unique telegram_ids from questions
          const telegramIds = [...new Set(questionsData.map(q => q.telegram_id).filter(Boolean))];
          
          // Fetch user data for these telegram_ids
          const { data: usersData } = await supabase
            .from('users')
            .select('id, first_name, last_name, telegram_id')
            .in('telegram_id', telegramIds);

          // Fetch cases data to determine client status
          const { data: casesData } = await supabase
            .from('cases')
            .select('telegram_id')
            .in('telegram_id', telegramIds);

          // Create a map of telegram_id to user data
          const usersMap = new Map();
          usersData?.forEach(user => {
            usersMap.set(user.telegram_id, user);
          });

          // Create a set of telegram_ids that exist in cases (clients)
          const clientTelegramIds = new Set(casesData?.map(c => c.telegram_id) || []);

          const formattedQuestions = questionsData.map(q => {
            const user = usersMap.get(q.telegram_id);
            const isClient = clientTelegramIds.has(q.telegram_id);
            
            return {
              id: q.id,
              clientName: user 
                ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User'
                : 'Unknown User',
              question: q.text,
              dateSubmitted: q.created_at?.split('T')[0] || '2025-01-01',
              status: (q.status === 'new' ? 'open' : 
                      q.status === 'answered' ? 'answered' : 'pending') as Question['status'],
              language: q.lang || 'English',
              answer: q.answer,
              clientType: isClient ? 'client' : 'non-client' as 'client' | 'non-client'
            };
          });
          setQuestions(formattedQuestions);
        } else {
          setQuestions([]);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Filter questions based on selected filter
  useEffect(() => {
    if (filter === 'all') {
      setFilteredQuestions(questions);
    } else {
      setFilteredQuestions(questions.filter(q => q.clientType === filter));
    }
  }, [questions, filter]);

  // Set up real-time subscription for new questions
  useEffect(() => {
    const channel = supabase
      .channel('questions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'questions'
        },
        (payload) => {
          console.log('New question received:', payload);
          toast({
            title: "New Question",
            description: "A new question has been received from a client.",
          });
          
          // Refresh questions list
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'questions'
        },
        (payload) => {
          console.log('Question updated:', payload);
          
          // Update the question in local state
          setQuestions(prevQuestions =>
            prevQuestions.map(q =>
              q.id === payload.new.id
                ? {
                    ...q,
                    status: payload.new.status === 'answered' ? 'answered' : 
                           payload.new.status === 'new' ? 'open' : 'pending',
                    answer: payload.new.answer
                  }
                : q
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleSendResponse = async () => {
    if (!selectedQuestion || !answer.trim()) {
      toast({
        title: "Error",
        description: "Please enter a response",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Sending response for question:', selectedQuestion.id);
      
      // First, get the question details including telegram_id
      const { data: questionData, error: fetchError } = await supabase
        .from('questions')
        .select('telegram_id, text')
        .eq('id', selectedQuestion.id)
        .single();

      if (fetchError) {
        console.error('Error fetching question:', fetchError);
        toast({
          title: "Error",
          description: "Failed to fetch question details",
          variant: "destructive"
        });
        return;
      }

      // Update the question in database
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
        toast({
          title: "Error",
          description: `Error sending response: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Response sent successfully');

      // Send Telegram notification to the user
      try {
        const notificationResponse = await supabase.functions.invoke('telegram-notify', {
          body: {
            telegram_id: questionData.telegram_id,
            message: `🔔 <b>Answer from your lawyer:</b>\n\n<b>Your question:</b> ${questionData.text.substring(0, 100)}${questionData.text.length > 100 ? '...' : ''}\n\n<b>Answer:</b> ${answer.trim()}`,
            question_id: selectedQuestion.id
          }
        });

        if (notificationResponse.error) {
          console.error('Telegram notification error:', notificationResponse.error);
          toast({
            title: "Warning",
            description: "Response saved but failed to notify client via Telegram",
            variant: "destructive"
          });
        } else {
          console.log('Telegram notification sent successfully');
        }
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
      }

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
      
      // Clear any saved draft
      const draftKey = `draft_${selectedQuestion.id}`;
      localStorage.removeItem(draftKey);
      
      toast({
        title: "Success",
        description: "Response sent successfully and client notified!"
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedQuestion || !answer.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content to save as draft",
        variant: "destructive"
      });
      return;
    }

    setIsSavingDraft(true);
    try {
      console.log('Saving draft for question:', selectedQuestion.id);
      
      // Save draft to localStorage for now (in a real app, this could be saved to database)
      const draftKey = `draft_${selectedQuestion.id}`;
      localStorage.setItem(draftKey, answer.trim());

      console.log('Draft saved successfully');
      toast({
        title: "Success",
        description: "Draft saved successfully!"
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Error saving draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const loadDraft = (questionId: number) => {
    const draftKey = `draft_${questionId}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      setAnswer(savedDraft);
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
                <Button 
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={!answer.trim() || isSavingDraft}
                >
                  {isSavingDraft ? 'Saving...' : 'Save Draft'}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Questions</h1>
          <p className="text-muted-foreground">Manage and respond to client inquiries</p>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'client' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('client')}
          >
            Client
          </Button>
          <Button
            variant={filter === 'non-client' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('non-client')}
          >
            Non Client
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {filteredQuestions.filter(q => q.status === 'open').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {filteredQuestions.filter(q => q.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Answered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {filteredQuestions.filter(q => q.status === 'answered').length}
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
                {filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No questions found
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((question) => (
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
                          onClick={() => {
                            setSelectedQuestion(question);
                            loadDraft(question.id);
                          }}
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
