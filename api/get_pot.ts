import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from 'redis';
import { strerror } from "../src/utils.js";
import { SessionManager, YoutubeSessionDataCaches } from "../src/session_manager.js";


const redisUrl = process.env.REDIS_URL;
const redis = await createClient({ url: redisUrl }).connect();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const body = req.body || {};
    if (body.data_sync_id)
        return res.status(400).send({
            error: "data_sync_id is deprecated, use content_binding instead",
        });
    if (body.visitor_data)
        return res.status(400).send({
            error: "visitor_data is deprecated, use content_binding instead",
        });

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

    const contentBinding: string | undefined = body.content_binding;
    const proxy: string = body.proxy;
    const bypassCache: boolean = body.bypass_cache || false;
    const sourceAddress: string | undefined = body.source_address;
    const disableTlsVerification: boolean =
        body.disable_tls_verification || false;

    try {
        const sessionData = await sessionManager.generatePoToken(
            contentBinding,
            proxy,
            bypassCache,
            sourceAddress,
            disableTlsVerification,
            body.challenge,
            body.disable_innertube || false,
            body.innertube_context,
        );

        await redis.set('youtube_session_data', JSON.stringify(cache));

        res.send(sessionData);
    } catch (e) {
        const msg = strerror(e, /*update=*/ true);
        console.error(e.stack);
        res.status(500).send({ error: msg });
    }

}