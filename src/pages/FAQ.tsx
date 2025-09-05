import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  language: 'English' | 'Polish';
  category?: string;
}

const faqs: FAQItem[] = [
  {
    id: 1,
    question: 'How long does Karta Pobytu take?',
    answer: 'Usually 6–12 months depending on the case complexity and current processing times.',
    language: 'Polish'
  },
  {
    id: 2,
    question: 'Which documents are required?',
    answer: 'Passport, rental contract, employment contract, health insurance, and proof of income.',
    language: 'English'
  },
  {
    id: 3,
    question: 'Can I travel while my application is pending?',
    answer: 'Yes, you can travel with your current documents and temporary residence stamp.',
    language: 'English'
  },
  {
    id: 4,
    question: 'What happens if my application is rejected?',
    answer: 'You can appeal the decision within 14 days or submit a new application with corrected documents.',
    language: 'English'
  },
  {
    id: 5,
    question: 'Czy mogę pracować podczas oczekiwania na decyzję?',
    answer: 'Tak, możesz kontynuować pracę z aktualnym zezwoleniem na pracę.',
    language: 'Polish'
  }
];

const getLanguageBadge = (language: FAQItem['language']) => {
  return (
    <Badge 
      variant="outline" 
      className={language === 'Polish' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-primary/10 text-primary border-primary/20'}
    >
      {language}
    </Badge>
  );
};

const FAQ = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const { data, error } = await supabase
          .from('faq')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedFAQs = data.map(faq => ({
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            language: (faq.language === 'pl' ? 'Polish' : 'English') as FAQItem['language'],
            category: faq.category
          }));
          setFaqs(formattedFAQs);
        } else {
          // Fallback data if no FAQs in database
          setFaqs([
            {
              id: 1,
              question: 'How long does Karta Pobytu take?',
              answer: 'Usually 6–12 months depending on the case complexity and current processing times.',
              language: 'English'
            },
            {
              id: 2,
              question: 'Which documents are required?',
              answer: 'Passport, rental contract, employment contract, health insurance, and proof of income.',
              language: 'English'
            },
            {
              id: 3,
              question: 'Can I travel while my application is pending?',
              answer: 'Yes, you can travel with your current documents and temporary residence stamp.',
              language: 'English'
            },
            {
              id: 4,
              question: 'What happens if my application is rejected?',
              answer: 'You can appeal the decision within 14 days or submit a new application with corrected documents.',
              language: 'English'
            },
            {
              id: 5,
              question: 'Czy mogę pracować podczas oczekiwania na decyzję?',
              answer: 'Tak, możesz kontynuować pracę z aktualnym zezwoleniem na pracę.',
              language: 'Polish'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        // Keep fallback data on error
        setFaqs([
          {
            id: 1,
            question: 'How long does Karta Pobytu take?',
            answer: 'Usually 6–12 months depending on the case complexity and current processing times.',
            language: 'English'
          },
          {
            id: 2,
            question: 'Which documents are required?',
            answer: 'Passport, rental contract, employment contract, health insurance, and proof of income.',
            language: 'English'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQs();
  }, []);
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
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {/* FAQ Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left p-4 font-semibold text-primary">Question</th>
                  <th className="text-left p-4 font-semibold text-primary">Answer</th>
                  <th className="text-left p-4 font-semibold text-primary">Language</th>
                  <th className="text-left p-4 font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {faqs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      No FAQs found
                    </td>
                  </tr>
                ) : (
                  faqs.map((faq) => (
                    <tr key={faq.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="font-medium max-w-xs">
                          {faq.question}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-muted-foreground max-w-md">
                          {faq.answer}
                        </div>
                      </td>
                      <td className="p-4">
                        {getLanguageBadge(faq.language)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
              {faqs.filter(f => f.language === 'English').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Polish FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {faqs.filter(f => f.language === 'Polish').length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;