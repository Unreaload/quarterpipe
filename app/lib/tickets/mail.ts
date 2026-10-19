import { sendTransactionalEmail } from '../newsletter';

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/**
 * Eine Mail pro Anmeldung: Der Link darin führt zur Ticket-Seite, auf der die
 * Anmeldung bestätigt wird und danach die QR-Codes stehen. So bleibt es bei
 * einer Mail pro Person (Brevo-Tageslimit) und die Adresse ist trotzdem geprüft.
 */
export async function sendOrderMail(o: {
  to: string;
  name: string;
  eventTitle: string;
  when: string;
  quantity: number;
  url: string;
}): Promise<void> {
  const places = o.quantity === 1 ? '1 Platz' : `${o.quantity} Plätze`;

  const text = [
    `Moin ${o.name},`,
    '',
    `du hast dich für „${o.eventTitle}“ angemeldet (${o.when}, ${places}).`,
    '',
    'Öffne diesen Link und bestätige deine Anmeldung. Danach siehst du dort deine Tickets mit QR-Code:',
    '',
    o.url,
    '',
    'Bitte innerhalb von 24 Stunden bestätigen, sonst verfällt die Anmeldung.',
    'Über denselben Link kommst du jederzeit wieder zu deinen Tickets – und kannst absagen, falls du doch nicht kannst.',
    '',
    'Falls du dich nicht angemeldet hast, ignoriere diese E-Mail einfach.',
    '',
    'Quarterpipe // Versmannstraße 66 // 20457 Hamburg',
  ].join('\n');

  const title = escapeHtml(o.eventTitle);
  const html = `<!doctype html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;border:3px solid #000;">
        <tr><td style="background:#000;color:#fff;padding:28px 28px;font-family:'Arial Black',Helvetica,Arial,sans-serif;font-weight:900;font-style:italic;font-size:34px;letter-spacing:-1px;">
          QUARTERPIPE
        </td></tr>
        <tr><td style="padding:32px 28px;font-family:Helvetica,Arial,sans-serif;color:#000;">
          <p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#666;">${escapeHtml(o.when)} // ${places}</p>
          <p style="margin:0 0 20px;font-size:26px;font-weight:900;font-style:italic;letter-spacing:-0.5px;line-height:1.1;">${title}</p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.5;">Moin ${escapeHtml(o.name)}, bestätige deine Anmeldung – danach findest du unter dem Link deine Tickets mit QR-Code.</p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background-color:#000000;border:3px solid #000000;">
            <a href="${o.url}" style="display:inline-block;background-color:#000000;padding:16px 28px;font-family:'Arial Black',Helvetica,Arial,sans-serif;font-weight:900;font-style:italic;font-size:18px;line-height:1;color:#ffffff;text-decoration:none;"><span style="color:#ffffff;text-decoration:none;">BESTÄTIGEN &amp; TICKETS →</span></a>
          </td></tr></table>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#333;">Bitte innerhalb von 24 Stunden bestätigen. Heb diese Mail auf: Über den Link kommst du jederzeit wieder zu deinen Tickets und kannst auch absagen.</p>
          <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#666;">Falls du dich nicht angemeldet hast, ignoriere diese E-Mail einfach.</p>
        </td></tr>
        <tr><td style="border-top:3px solid #000;padding:16px 28px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;">
          Versmannstraße 66 // 20457 Hamburg
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await sendTransactionalEmail({ to: o.to, subject: `Bestätige deine Anmeldung: ${o.eventTitle}`, text, html });
}
