import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'message' | 'document' | 'question';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Listen for new messages
    const messagesChannel = supabase
      .channel('messages-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newNotification: Notification = {
            id: `message-${payload.new.id}`,
            type: 'message',
            title: 'New Message',
            description: `New message from client`,
            timestamp: new Date(),
            read: false
          };
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    // Listen for new documents
    const documentsChannel = supabase
      .channel('documents-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'documents'
        },
        (payload) => {
          const newNotification: Notification = {
            id: `document-${payload.new.id}`,
            type: 'document',
            title: 'New Document',
            description: `${payload.new.original_name} uploaded`,
            timestamp: new Date(),
            read: false
          };
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    // Listen for new questions
    const questionsChannel = supabase
      .channel('questions-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'questions'
        },
        async (payload) => {
          // Get user name for the notification
          let clientName = 'Unknown Client';
          try {
            const { data: userData } = await supabase
              .rpc('get_users_by_telegram_ids', { telegram_ids: [payload.new.telegram_id] });
            
            if (userData && userData.length > 0) {
              const user = userData[0] as any;
              clientName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Unknown Client';
            }
          } catch (error) {
            console.error('Error fetching user data for notification:', error);
          }

          const newNotification: Notification = {
            id: `question-${payload.new.id}`,
            type: 'question',
            title: 'New Question',
            description: `${clientName} asked: ${payload.new.text.substring(0, 50)}${payload.new.text.length > 50 ? '...' : ''}`,
            timestamp: new Date(),
            read: false
          };
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(documentsChannel);
      supabase.removeChannel(questionsChannel);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};