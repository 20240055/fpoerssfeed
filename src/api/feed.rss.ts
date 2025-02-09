import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export async function GET() {
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: true });

  const baseUrl = new URL(Astro.request.url).origin;
  
  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:ical="http://www.w3.org/2002/12/cal/ical#">
  <channel>
    <title>RSS Kalender</title>
    <link>${baseUrl}</link>
    <description>Kalendereinträge als RSS Feed</description>
    ${events?.map(event => `
    <item>
      <title>${event.title}</title>
      <description>${event.description}</description>
      <ical:dtstart>${format(new Date(event.start_date), "yyyyMMdd'T'HHmmss")}</ical:dtstart>
      <ical:dtend>${format(new Date(event.end_date), "yyyyMMdd'T'HHmmss")}</ical:dtend>
      ${event.location ? `<ical:location>${event.location}</ical:location>` : ''}
      <guid>${event.id}</guid>
    </item>
    `).join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
