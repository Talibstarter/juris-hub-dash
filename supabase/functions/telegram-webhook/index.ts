import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelegramUpdate {
  message?: {
    message_id: number
    from: {
      id: number
      first_name: string
      last_name?: string
      username?: string
    }
    chat: {
      id: number
      type: string
    }
    date: number
    text?: string
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const update: TelegramUpdate = await req.json()
    console.log('Received Telegram update:', JSON.stringify(update, null, 2))

    if (!update.message) {
      return new Response('No message in update', { status: 200, headers: corsHeaders })
    }

    const { message } = update
    const telegramId = message.from.id
    const text = message.text || ''

    // Find or create user
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single()

    if (userError && userError.code === 'PGRST116') {
      // User doesn't exist, create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          telegram_id: telegramId,
          first_name: message.from.first_name,
          last_name: message.from.last_name,
          username: message.from.username,
          role: 'client'
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return new Response('Error creating user', { status: 500, headers: corsHeaders })
      }
      user = newUser
    } else if (userError) {
      console.error('Error finding user:', userError)
      return new Response('Error finding user', { status: 500, headers: corsHeaders })
    }

    // Store the message as a question
    const { error: questionError } = await supabase
      .from('questions')
      .insert({
        telegram_id: telegramId,
        text: text,
        status: 'new',
        lang: 'en'
      })

    if (questionError) {
      console.error('Error storing question:', questionError)
      return new Response('Error storing question', { status: 500, headers: corsHeaders })
    }

    console.log('Successfully processed Telegram message')
    return new Response('OK', { status: 200, headers: corsHeaders })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})