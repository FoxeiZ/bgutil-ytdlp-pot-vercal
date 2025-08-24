import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from 'redis';
import { SessionManager, YoutubeSessionDataCaches } from "../src/session_manager.js";


const redisUrl = process.env.REDIS_URL;
const redis = await createClient({ url: redisUrl }).connect();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const cache: YoutubeSessionDataCaches = {};

    const cacheData = await redis.get('youtube_session_data');
    if (cacheData) {
        const parsedData = JSON.parse(cacheData) as YoutubeSessionDataCaches;
        for (const contentBinding in parsedData) {
            const parsedCache = parsedData[contentBinding];
            if (parsedCache) {
                const expiresAt = new Date(parsedCache.expiresAt);
                if (!isNaN(expiresAt.getTime())) {
                    cache[contentBinding] = {
                        poToken: parsedCache.poToken,
                        expiresAt,
                        contentBinding: contentBinding,
                    }
                };
            }
        }
    }

    const sessionManager = new SessionManager(false, cache || {});
    return res.send(Array.from(sessionManager.minterCache.keys()));
}