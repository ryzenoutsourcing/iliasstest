import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const TO_EMAIL = Deno.env.get('TO_EMAIL')        // zet op: ryzenoutsourcing@gmail.com
const FROM_EMAIL = Deno.env.get('FROM_EMAIL')    // bijv. noreply@jouwdomein.be of onboarding@resend.dev
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { naam, achternaam, mobiel, email, bericht } = await req.json()

    if (!naam || !email || !bericht) {
      return new Response(JSON.stringify({ error: 'Verplichte velden ontbreken' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 1. Opslaan in database
    const { error: insertError } = await supabase
      .from('contact_submissions')
      .insert([{ naam, achternaam, mobiel, email, bericht }])

    if (insertError) console.error('Database insert error:', insertError)

    // 2. E-mail versturen via Resend (gratis)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        subject: `Nieuw bericht van ${naam} ${achternaam}`,
        html: `<h2>Contact Auto M50</h2>
               <p><strong>Naam:</strong> ${naam} ${achternaam}</p>
               <p><strong>Telefoon:</strong> ${mobiel}</p>
               <p><strong>E-mail:</strong> ${email}</p>
               <p><strong>Bericht:</strong><br>${bericht.replace(/\n/g, '<br>')}</p>`
      })
    })

    if (!res.ok) {
        const errorData = await res.json()
        console.error('Resend error:', errorData)
        throw new Error('E-mail niet verzonden')
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
