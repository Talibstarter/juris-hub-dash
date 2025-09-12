import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  language: string;
  category?: string;
  question_pl?: string;
  answer_pl?: string;
  question_ru?: string;
  answer_ru?: string;
}

const FAQ = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedFAQs, setExpandedFAQs] = useState<Set<number>>(new Set());
  const [newFAQ, setNewFAQ] = useState({
    question: '',
    answer: '',
    question_pl: '',
    answer_pl: '',
    question_ru: '',
    answer_ru: ''
  });
  const [showPolish, setShowPolish] = useState(false);
  const [showRussian, setShowRussian] = useState(false);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const { data, error } = await supabase
          .from('faq')
          .select('id, question, answer, language, category, question_pl, answer_pl, question_ru, answer_ru, is_published, author_id, created_at, updated_at')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedFAQs = data.map(faq => ({
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            language: faq.language,
            category: faq.category,
            question_pl: faq.question_pl,
            answer_pl: faq.answer_pl,
            question_ru: faq.question_ru,
            answer_ru: faq.answer_ru
          }));
          setFaqs(formattedFAQs);
        } else {
          // Fallback data
          setFaqs([
            {
              id: 1,
              question: 'How long does Karta Pobytu take?',
              answer: 'Usually 6–12 months depending on the case complexity and current processing times.',
              language: 'en'
            },
            {
              id: 2,
              question: 'Which documents are required?',
              answer: 'Passport, rental contract, employment contract, health insurance, and proof of income.',
              language: 'en'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        setFaqs([
          {
            id: 1,
            question: 'How long does Karta Pobytu take?',
            answer: 'Usually 6–12 months depending on the case complexity and current processing times.',
            language: 'en'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const handleAddFAQ = async () => {
    if (!newFAQ.question.trim() || !newFAQ.answer.trim()) {
      alert('Please fill in both question and answer fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('faq')
        .insert([{
          question: newFAQ.question.trim(),
          answer: newFAQ.answer.trim(),
          question_pl: newFAQ.question_pl.trim() || null,
          answer_pl: newFAQ.answer_pl.trim() || null,
          question_ru: newFAQ.question_ru.trim() || null,
          answer_ru: newFAQ.answer_ru.trim() || null,
          language: 'en',
          category: null,
          is_published: true,
          author_id: null
        }])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        alert(`Error adding FAQ: ${error.message}`);
        return;
      }

      const formattedFAQ: FAQItem = {
        id: data.id,
        question: data.question,
        answer: data.answer,
        language: data.language,
        category: data.category,
        question_pl: data.question_pl,
        answer_pl: data.answer_pl,
        question_ru: data.question_ru,
        answer_ru: data.answer_ru
      };

      setFaqs(prevFaqs => [formattedFAQ, ...prevFaqs]);

      setNewFAQ({
        question: '',
        answer: '',
        question_pl: '',
        answer_pl: '',
        question_ru: '',
        answer_ru: ''
      });
      setShowPolish(false);
      setShowRussian(false);
      setIsAddDialogOpen(false);
      alert('FAQ added successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">FAQ Management</h1>
          <p className="text-muted-foreground">Manage frequently asked questions for your clients</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New FAQ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  placeholder="Enter the frequently asked question..."
                  value={newFAQ.question}
                  onChange={(e) => setNewFAQ(prev => ({ ...prev, question: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="answer">Answer *</Label>
                <Textarea
                  id="answer"
                  placeholder="Enter the answer to the question..."
                  value={newFAQ.answer}
                  onChange={(e) => setNewFAQ(prev => ({ ...prev, answer: e.target.value }))}
                  rows={4}
                />
              </div>

              {/* Translation Toggle Buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={showPolish ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowPolish(!showPolish)}
                >
                  {showPolish ? "Remove" : "Add"} Polish
                </Button>
                <Button
                  type="button"
                  variant={showRussian ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowRussian(!showRussian)}
                >
                  {showRussian ? "Remove" : "Add"} Russian
                </Button>
              </div>

              {/* Polish Translation Fields */}
              {showPolish && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <h4 className="font-semibold text-sm">Polish Translation</h4>
                  <div>
                    <Label htmlFor="question_pl">Question (Polish)</Label>
                    <Input
                      id="question_pl"
                      placeholder="Enter the question in Polish..."
                      value={newFAQ.question_pl}
                      onChange={(e) => setNewFAQ(prev => ({ ...prev, question_pl: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="answer_pl">Answer (Polish)</Label>
                    <Textarea
                      id="answer_pl"
                      placeholder="Enter the answer in Polish..."
                      value={newFAQ.answer_pl}
                      onChange={(e) => setNewFAQ(prev => ({ ...prev, answer_pl: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Russian Translation Fields */}
              {showRussian && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <h4 className="font-semibold text-sm">Russian Translation</h4>
                  <div>
                    <Label htmlFor="question_ru">Question (Russian)</Label>
                    <Input
                      id="question_ru"
                      placeholder="Enter the question in Russian..."
                      value={newFAQ.question_ru}
                      onChange={(e) => setNewFAQ(prev => ({ ...prev, question_ru: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="answer_ru">Answer (Russian)</Label>
                    <Textarea
                      id="answer_ru"
                      placeholder="Enter the answer in Russian..."
                      value={newFAQ.answer_ru}
                      onChange={(e) => setNewFAQ(prev => ({ ...prev, answer_ru: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddFAQ}
                  disabled={!newFAQ.question.trim() || !newFAQ.answer.trim()}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  Add FAQ
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              No FAQs found
            </CardContent>
          </Card>
        ) : (
          faqs.map((faq) => {
            const isExpanded = expandedFAQs.has(faq.id);
            const hasTranslations = faq.question_pl || faq.answer_pl || faq.question_ru || faq.answer_ru;
            
            return (
              <Card key={faq.id} className="shadow-card">
                <Collapsible 
                  open={isExpanded} 
                  onOpenChange={(open) => {
                    const newExpanded = new Set(expandedFAQs);
                    if (open) {
                      newExpanded.add(faq.id);
                    } else {
                      newExpanded.delete(faq.id);
                    }
                    setExpandedFAQs(newExpanded);
                  }}
                >
                  <CollapsibleTrigger asChild>
                    <div className="p-6 cursor-pointer hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-primary text-lg">{faq.question}</h3>
                            <Badge variant="outline" className="text-xs">
                              {faq.language === 'en' ? 'English' : faq.language === 'pl' ? 'Polish' : 'Russian'}
                            </Badge>
                            {faq.category && (
                              <Badge variant="secondary" className="text-xs">
                                {faq.category}
                              </Badge>
                            )}
                          </div>
                          {hasTranslations ? (
                            <p className="text-xs text-muted-foreground">Click to view translations</p>
                          ) : (
                            <p className="text-xs text-muted-foreground">Click to view full answer</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-6 pb-6 border-t bg-muted/10">
                      <div className="mt-4">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Answer</h4>
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                      
                      {hasTranslations && (
                        <div className="mt-6">
                          <h4 className="font-semibold text-sm text-muted-foreground mb-4">Other Languages</h4>
                          <div className="space-y-4">
                            {(faq.question_pl || faq.answer_pl) && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">Polish</Badge>
                                </div>
                                {faq.question_pl && (
                                  <div>
                                    <p className="font-medium text-primary">{faq.question_pl}</p>
                                  </div>
                                )}
                                {faq.answer_pl && (
                                  <div>
                                    <p className="text-muted-foreground leading-relaxed">{faq.answer_pl}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {(faq.question_ru || faq.answer_ru) && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">Russian</Badge>
                                </div>
                                {faq.question_ru && (
                                  <div>
                                    <p className="font-medium text-primary">{faq.question_ru}</p>
                                  </div>
                                )}
                                {faq.answer_ru && (
                                  <div>
                                    <p className="text-muted-foreground leading-relaxed">{faq.answer_ru}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{faqs.length}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">English FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {faqs.filter(f => f.language === 'en').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Polish FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {faqs.filter(f => f.language === 'pl').length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;