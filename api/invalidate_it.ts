import type { VercelRequest, VercelResponse } from '@vercel/node'
import init_session from '../src/init_session.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { sessionManager, redis } = await init_session();
    sessionManager.invalidateIT();
    const cache = sessionManager.getYoutubeSessionDataCaches();
    await redis.set('youtube_session_data', JSON.stringify(cache));
    res.send({ success: true });
}