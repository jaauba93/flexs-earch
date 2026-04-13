import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, phone, message, workstations_from, workstations_to, listing_ids, listing_names } = body

    if (!email || !listing_ids?.length) {
      return NextResponse.json({ error: 'Brak wymaganych danych' }, { status: 400 })
    }

    // Save to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabase.from('enquiries').insert({
      email,
      phone: phone || null,
      message: message || null,
      workstations_from: workstations_from || null,
      workstations_to: workstations_to || null,
      listing_ids,
    })

    if (!resend) {
      console.warn('Skipping email send: RESEND_API_KEY is not configured')
      return NextResponse.json({ error: 'Błąd konfiguracji poczty' }, { status: 500 })
    }

    // Send email via Resend
    const listingsHtml = (listing_names as string[])
      .map((name: string) => `<li style="margin-bottom:4px">${name}</li>`)
      .join('')

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'flex@colliers.pl',
      to: process.env.RESEND_TO_EMAIL || 'jakub.bawol@colliers.com',
      replyTo: email,
      subject: `Nowe zapytanie ofertowe — Colliers Flex`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #000759; max-width: 600px;">
          <div style="background:#000759; padding: 24px 32px;">
            <h1 style="color:#fff; font-size: 20px; margin:0;">Nowe zapytanie ofertowe</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="font-size:16px; margin-bottom:16px;">Dane kontaktowe</h2>
            <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
              <tr><td style="padding:6px 0; color:#555; width:40%">Email:</td><td><strong>${email}</strong></td></tr>
              ${phone ? `<tr><td style="padding:6px 0; color:#555">Telefon:</td><td><strong>${phone}</strong></td></tr>` : ''}
              ${workstations_from || workstations_to ? `<tr><td style="padding:6px 0; color:#555">Stanowiska:</td><td><strong>${workstations_from || '–'} – ${workstations_to || '–'}</strong></td></tr>` : ''}
              ${message ? `<tr><td style="padding:6px 0; color:#555; vertical-align:top">Wiadomość:</td><td>${message}</td></tr>` : ''}
            </table>

            <h2 style="font-size:16px; margin-bottom:12px;">Zapytane biura</h2>
            <ul style="padding-left:20px; margin:0 0 24px;">${listingsHtml}</ul>

            <p style="color:#555; font-size:13px; border-top:1px solid #BDBDBD; padding-top:16px;">
              Zapytanie złożone przez formularz na <a href="https://flex.colliers.pl" style="color:#1C54F4">flex.colliers.pl</a>
            </p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('Contact API error:', err)
    const message = err instanceof Error ? err.message : 'Błąd serwera'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
