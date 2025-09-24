import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  clientName: string;
  content: string;
  dateSubmitted: string;
  status: 'open' | 'answered' | 'pending';
  language?: string;
  sender_id: number;
  case_id?: number;
  telegram_id?: number;
  replies: Message[];
  clientType: 'client' | 'non-client';
}

const getStatusBadge = (status: Message['status']) => {
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
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [reply, setReply] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [filter, setFilter] = useState<'all' | 'client' | 'non-client'>('all');
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Fetch messages that don't have a parent (root messages only)
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select('*')
          .is('parent_message_id', null)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (messagesData && messagesData.length > 0) {
          // Get unique sender_ids from messages (these are now telegram_ids)
          const senderIds = [...new Set(messagesData.map(m => m.sender_id).filter(Boolean))];
          
          // Use raw SQL query to avoid TypeScript issues with column names
          const { data: usersData } = await supabase
            .rpc('get_users_by_ids', { user_ids: senderIds });

          // If the RPC doesn't exist, fall back to a direct query
          let usersList = usersData;
          if (!usersData) {
            const { data: fallbackUsers } = await supabase
              .from('users')
              .select('*')
              .in('telegram_id', senderIds);
            usersList = fallbackUsers;
          }

          // Get telegram_ids from users to check client status
          const telegramIds = usersList?.map((u: any) => u.id || u.telegram_id).filter(Boolean) || [];

          // Fetch cases data to determine client status
          const { data: casesData } = await supabase
            .from('cases')
            .select('telegram_id')
            .in('telegram_id', telegramIds);

          // Create a map of telegram_id to user data
          const usersMap = new Map();
          usersList?.forEach((user: any) => {
            usersMap.set(user.id || user.telegram_id, user);
          });

          // Create a set of telegram_ids that exist in cases (clients)
          const clientTelegramIds = new Set(casesData?.map(c => c.telegram_id) || []);

          // Fetch replies for each message
          const messageIds = messagesData.map(m => m.id);
          const { data: repliesData } = await supabase
            .from('messages')
            .select('*')
            .in('parent_message_id', messageIds)
            .order('created_at', { ascending: true });

          // Group replies by parent message id
          const repliesMap = new Map();
          repliesData?.forEach(reply => {
            if (!repliesMap.has(reply.parent_message_id)) {
              repliesMap.set(reply.parent_message_id, []);
            }
            repliesMap.get(reply.parent_message_id).push(reply);
          });

          const formattedMessages = messagesData.map(m => {
            const user = usersMap.get(m.sender_id);
            const isClient = user && clientTelegramIds.has(user.id); // user.id is telegram_id
            const replies = repliesMap.get(m.id) || [];
            
            return {
              id: m.id,
              clientName: user 
                ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Unknown User'
                : 'Unknown User',
              content: m.content,
              dateSubmitted: m.created_at?.split('T')[0] || '2025-01-01',
              status: (replies.length > 0 ? 'answered' : 'open') as Message['status'],
              language: m.language || 'English',
              sender_id: m.sender_id,
              case_id: m.case_id,
              telegram_id: m.sender_id, // sender_id is the telegram_id
              replies: replies,
              clientType: isClient ? 'client' : 'non-client' as 'client' | 'non-client'
            };
          });
          setMessages(formattedMessages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Filter messages based on selected filter
  useEffect(() => {
    if (filter === 'all') {
      setFilteredMessages(messages);
    } else {
      setFilteredMessages(messages.filter(m => m.clientType === filter));
    }
  }, [messages, filter]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message received:', payload);
          toast({
            title: "New Message",
            description: "A new message has been received from a client.",
          });
          
          // Refresh messages list
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleSendReply = async () => {
    if (!selectedMessage || !reply.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Sending reply for message:', selectedMessage.id);
      
      // Insert reply as a new message with parent_message_id
      const { data: replyResult, error } = await supabase
        .from('messages')
        .insert({
          content: reply.trim(),
          parent_message_id: selectedMessage.id,
          sender_id: 1, // Assuming lawyer telegram_id is 1 for now
          recipient_id: selectedMessage.sender_id,
          case_id: selectedMessage.case_id,
          type: 'response',
          language: 'en'
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "Error",
          description: `Error sending reply: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Reply sent successfully:', replyResult);

      // Send Telegram notification to the user
      try {
        if (selectedMessage.telegram_id) {
          const notificationResponse = await supabase.functions.invoke('telegram-notify', {
            body: {
              telegram_id: selectedMessage.telegram_id,
              message: `🔔 <b>Reply from your lawyer:</b>\n\n<b>Your message:</b> ${selectedMessage.content.substring(0, 100)}${selectedMessage.content.length > 100 ? '...' : ''}\n\n<b>Reply:</b> ${reply.trim()}`,
              message_id: selectedMessage.id
            }
          });

          if (notificationResponse.error) {
            console.error('Telegram notification error:', notificationResponse.error);
            toast({
              title: "Warning",
              description: "Reply saved but failed to notify client via Telegram",
              variant: "destructive"
            });
          } else {
            console.log('Telegram notification sent successfully');
          }
        }
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
      }

      // Update local state - add reply to the message
      setMessages(prevMessages => 
        prevMessages.map(m => 
          m.id === selectedMessage.id 
            ? { 
                ...m, 
                status: 'answered' as const,
                replies: [...m.replies, {
                  ...replyResult,
                  clientName: 'Lawyer',
                  dateSubmitted: replyResult.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                  status: 'answered' as const,
                  language: replyResult.language || 'en',
                  sender_id: replyResult.sender_id,
                  case_id: replyResult.case_id,
                  replies: [],
                  clientType: 'non-client' as const
                }]
              }
            : m
        )
      );

      // Update selected message
      setSelectedMessage({
        ...selectedMessage,
        status: 'answered',
        replies: [...selectedMessage.replies, {
          ...replyResult,
          clientName: 'Lawyer',
          dateSubmitted: replyResult.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: 'answered' as const,
          language: replyResult.language || 'en',
          sender_id: replyResult.sender_id,
          case_id: replyResult.case_id,
          replies: [],
          clientType: 'non-client' as const
        }]
      });

      // Clear the reply input
      setReply('');
      
      // Clear any saved draft
      const draftKey = `draft_${selectedMessage.id}`;
      localStorage.removeItem(draftKey);
      
      toast({
        title: "Success",
        description: "Reply sent successfully and client notified!"
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
    if (!selectedMessage || !reply.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content to save as draft",
        variant: "destructive"
      });
      return;
    }

    setIsSavingDraft(true);
    try {
      console.log('Saving draft for message:', selectedMessage.id);
      
      // Save draft to localStorage for now (in a real app, this could be saved to database)
      const draftKey = `draft_${selectedMessage.id}`;
      localStorage.setItem(draftKey, reply.trim());

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

  const loadDraft = (messageId: number) => {
    const draftKey = `draft_${messageId}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      setReply(savedDraft);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (selectedMessage) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => setSelectedMessage(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Message Details</h1>
              <p className="text-muted-foreground">Respond to client message</p>
            </div>
          </div>
          {getStatusBadge(selectedMessage.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message Details */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-primary">Client Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Client</p>
                <p className="text-lg font-semibold">{selectedMessage.clientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date Submitted</p>
                <p>{selectedMessage.dateSubmitted}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Language</p>
                <p>{selectedMessage.language || 'English'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Message</p>
                <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                  <p>{selectedMessage.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reply Form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-primary">Your Reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Reply</p>
                <Textarea
                  placeholder="Type your reply to the client's message..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onFocus={() => loadDraft(selectedMessage.id)}
                  rows={6}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  className="bg-gradient-primary hover:opacity-90"
                  onClick={handleSendReply}
                  disabled={!reply.trim() || isSubmitting}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Sending...' : 'Send Reply'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={!reply.trim() || isSavingDraft}
                >
                  {isSavingDraft ? 'Saving...' : 'Save Draft'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversation History */}
        {selectedMessage.replies.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-primary">Conversation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedMessage.replies.map((reply, index) => (
                  <div key={reply.id} className="p-4 bg-success/5 border border-success/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Your Reply #{index + 1}</p>
                      <p className="text-xs text-muted-foreground">
                        {reply.dateSubmitted || 'Today'}
                      </p>
                    </div>
                    <p className="text-sm">{reply.content}</p>
                  </div>
                ))}
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
          <h1 className="text-3xl font-bold text-primary">Messages</h1>
          <p className="text-muted-foreground">Manage and respond to client messages</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {filteredMessages.filter(m => m.status === 'open').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {filteredMessages.filter(m => m.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Answered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {filteredMessages.filter(m => m.status === 'answered').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left p-4 font-semibold text-primary">Client Name</th>
                  <th className="text-left p-4 font-semibold text-primary">Message</th>
                  <th className="text-left p-4 font-semibold text-primary">Date Submitted</th>
                  <th className="text-left p-4 font-semibold text-primary">Status</th>
                  <th className="text-left p-4 font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No messages found
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((message) => (
                    <tr key={message.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="font-medium">{message.clientName}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm max-w-md truncate">
                          {message.content}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{message.dateSubmitted}</td>
                      <td className="p-4">
                        {getStatusBadge(message.status)}
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMessage(message);
                            loadDraft(message.id);
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {message.status === 'answered' ? 'View' : 'Reply'}
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
