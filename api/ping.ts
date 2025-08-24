import type { VercelRequest, VercelResponse } from '@vercel/node'
import { VERSION } from 'src/utils';

export default function handler(req: VercelRequest, res: VercelResponse) {
    return res.send({
        server_uptime: process.uptime(),
        version: VERSION,
    });
}