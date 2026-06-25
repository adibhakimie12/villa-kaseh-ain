import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminFromRequest } from '../src/lib/adminAuth';
import { getSql } from '../src/lib/db';
import { defaultSiteContent, normalizeSiteContent } from '../src/lib/siteContent';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const sql = getSql();
      const rows = await sql`select content from site_content where slug = 'main' limit 1`;
      const content = rows[0]?.content ? normalizeSiteContent(rows[0].content) : defaultSiteContent;
      res.status(200).json({ content, source: rows[0]?.content ? 'database' : 'default' });
      return;
    }

    if (req.method === 'PUT') {
      const admin = await requireAdminFromRequest(req);
      if (!admin.ok) {
        res.status(admin.status).json({ error: admin.error });
        return;
      }

      const content = normalizeSiteContent(req.body?.content);
      const sql = getSql();
      await sql`
        insert into site_content (slug, content, updated_at)
        values ('main', ${JSON.stringify(content)}::jsonb, now())
        on conflict (slug)
        do update set content = excluded.content, updated_at = now()
      `;
      res.status(200).json({ content, source: 'database' });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unexpected server error' });
  }
}
