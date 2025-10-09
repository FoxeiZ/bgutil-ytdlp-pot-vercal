import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Redis } from "@upstash/redis"
import { SessionManager, YoutubeSessionDataCaches } from "../src/session_manager.js";


const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const cache: YoutubeSessionDataCaches = {};

    const cacheData = await redis.get<object>('youtube_session_data');
    if (cacheData) {
        const parsedData = cacheData as YoutubeSessionDataCaches;
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