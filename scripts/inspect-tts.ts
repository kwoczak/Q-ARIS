
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Manually parse .env.local to avoid dotenv issues
const envPath = path.resolve(process.cwd(), '.env.local')
let env: Record<string, string> = {}

try {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/)
        if (match) {
            const key = match[1].trim()
            const value = match[2].trim().replace(/^['"]|['"]$/g, '')
            env[key] = value
        }
    })
} catch (e) {
    console.error("Could not read .env.local")
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function dumpAssets() {
    console.log("--- Dumping tts_assets (Limit 10) ---")

    const { data: assets, error } = await supabase
        .from('tts_assets')
        .select('*')
        .limit(10)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching assets:", error)
        return
    }

    if (!assets || assets.length === 0) {
        console.log("No assets found in tts_assets table.")
    } else {
        console.log(`Found ${assets.length} recent assets:`)
        assets.forEach(a => {
            console.log(`ID: ${a.id}`)
            console.log(`  Label: ${a.label}`)
            console.log(`  File: ${a.file_path}`)
            console.log(`  URL: ${a.public_url}`)
            console.log(`  Text: ${a.text_content.substring(0, 30)}...`)
            console.log('---')
        })
    }
}

dumpAssets()
