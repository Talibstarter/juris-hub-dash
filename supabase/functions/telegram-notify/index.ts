import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramNotificationRequest {
  telegram_id: number;
  message: string;
  question_id?: number;
}

const serve_handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telegram_id, message, question_id }: TelegramNotificationRequest = await req.json();
    
    console.log('Telegram notification request:', { telegram_id, message, question_id });

    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!telegramBotToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Telegram bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send message to Telegram
    const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    
    const telegramResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegram_id,
        text: message,
        parse_mode: 'HTML'
      }),
    });

    const telegramResult = await telegramResponse.json();
    
    if (!telegramResponse.ok) {
      console.error('Telegram API error:', telegramResult);
      return new Response(
        JSON.stringify({ error: 'Failed to send Telegram message', details: telegramResult }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Telegram message sent successfully:', telegramResult);

    // If this is an answer notification, we could update the database here
    // to mark that the notification was sent

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        telegram_message_id: telegramResult.message_id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in telegram-notify function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(serve_handler);