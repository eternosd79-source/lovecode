import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId } = await req.json()
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Missing orderId' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 
      })
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

    if (!RESEND_API_KEY) {
      console.warn("No RESEND_API_KEY provided. Skipping email send.")
      return new Response(JSON.stringify({ message: 'Email skipped (no API key)' }), { headers: corsHeaders })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Obtener datos de la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    // 1. Enviar email de confirmación al cliente (si proveyó email, por ahora no pedimos, 
    // pero si en el futuro se pide o lo asociamos por auth)
    // NOTA: Como en la UI actual solo pedimos el WhatsApp, este email va principalmente 
    // como notificación interna al ADMIN de CorazónCódigo.

    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'hola@corazoncodigo.me'
    
    const htmlEmail = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #c026d3;">¡Nuevo Pedido en CorazónCódigo! 💜</h2>
        <p><strong>ID Orden:</strong> ${order.id}</p>
        <p><strong>Cliente:</strong> ${order.customer_name || 'No especificado'}</p>
        <p><strong>Regalo para:</strong> ${order.target_name || 'No especificado'}</p>
        <p><strong>Plantilla:</strong> ${order.template_name}</p>
        <p><strong>Plan:</strong> ${order.plan_name}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <hr style="border:1px solid #eee; margin: 20px 0;">
        <p>Verifica el pago y genera el enlace final en el panel admin.</p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'CorazónCódigo <pedidos@corazoncodigo.me>',
        to: [adminEmail],
        subject: `Nuevo Pedido: ${order.template_name} - ${order.customer_name || 'Cliente'}`,
        html: htmlEmail
      })
    })

    if (!res.ok) {
      const respTxt = await res.text()
      console.error("Resend API Error:", respTxt)
      throw new Error('Failed to send email via Resend')
    }

    return new Response(JSON.stringify({ success: true, message: 'Email sent successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Edge function error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
