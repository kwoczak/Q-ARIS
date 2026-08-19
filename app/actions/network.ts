'use server'

import os from 'os'

export async function getLocalNetworkIp(): Promise<string> {
    try {
        const interfaces = os.networkInterfaces()
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name] || []) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address
                }
            }
        }
    } catch (e) {
        console.error("Failed to get local network IP:", e)
    }
    return '192.168.100.103'
}
