import { Redis } from "@upstash/redis"
import { SessionManager, YoutubeSessionDataCaches } from "./session_manager.ts";

export default async function initSession() {
    const redis = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
    });

    const cache: YoutubeSessionDataCaches = {};

    const cacheData = await redis.get<YoutubeSessionDataCaches>('youtube_session_data');
    if (cacheData) {
        for (const contentBinding in cacheData) {
            const parsedCache = cacheData[contentBinding];
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
    return { redis, sessionManager };
}