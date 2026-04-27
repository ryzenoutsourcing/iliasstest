/**
 * Supabase Edge Function: send-email
 *
 * Instructions:
 * 1. Create a new Edge Function in Supabase named 'send-email'.
 * 2. Set the following Environment Variables in Supabase:
 *    - RESEND_API_KEY: Your Resend API Key.
 *    - TO_EMAIL: ryzenoutsourcing@gmail.com
 *    - FROM_EMAIL: A verified sender email in your Resend account.
 * 3. Deploy this code.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const TO_EMAIL = Deno.env.get('TO_EMAIL')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL')

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

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Auto M50 Contact <${FROM_EMAIL}>`,
        to: [TO_EMAIL],
        subject: `Nieuwe aanvraag van ${naam} ${achternaam}`,
        html: `
          <h3>Nieuwe Contactaanvraag Auto M50</h3>
          <p><strong>Naam:</strong> ${naam} ${achternaam}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mobiel:</strong> ${mobiel}</p>
          <p><strong>Bericht:</strong></p>
          <p>${bericht}</p>
        `,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      return new Response(JSON.stringify({ success: false, error: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
