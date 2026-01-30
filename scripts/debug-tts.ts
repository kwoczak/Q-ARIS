
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env: Record<string, string> = {}

envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^['"]|['"]$/g, '') // remove quotes
        env[key] = value
    }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Service Role Key")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugStage(stageId: string) {
    console.log(`Checking Stage: ${stageId}`)

    // 1. Get Stage
    const { data: stage, error } = await supabase
        .from('stages')
        .select('*')
        .eq('id', stageId)
        .single()

    if (error) {
        console.error("Stage Error:", error)
        return
    }

    const audioUrls: string[] = []
    const blocks = stage.content.blocks || []

    console.log(`Found ${blocks.length} blocks`)

    blocks.forEach((b: any, i: number) => {
        if (b.type === 'audio') {
            console.log(`Block [${i}] AUDIO: ${b.content}`)
            if (typeof b.content === 'string') audioUrls.push(b.content)
        }
    })

    // 2. Check TTS Assets
    if (audioUrls.length === 0) {
        console.log("No audio blocks found")
        return
    }

    console.log("Querying TTS Assets for URLs:", audioUrls)

    const { data: assets, error: assetsError } = await supabase
        .from('tts_assets')
        .select('*')
        .in('public_url', audioUrls)

    if (assetsError) {
        console.error("Assets Error:", assetsError)
    } else {
        console.log(`Found ${assets?.length} exact matches in tts_assets`)
        assets?.forEach(a => console.log(` - MATCH: ${a.public_url} (ID: ${a.id})`))
    }

    // 3. Try fuzzy search
    console.log("Checking all TTS assets (limit 50) to see if we missed anything...")
    const { data: allAssets } = await supabase.from('tts_assets').select('id, public_url').limit(50)

    if (allAssets) {
        allAssets.forEach(a => {
            if (audioUrls.some(url => url === a.public_url)) return // skip matched
            console.log(` - EXIST: ${a.public_url}`)
            // Check encoding
            if (audioUrls.some(url => decodeURI(url) === decodeURI(a.public_url))) {
                console.log("   ^ MATCHES IF DECODED!")
            }
        })
    }
}

const targetStageId = '9bcf5eea-960a-403d-a798-3a079748d577'
debugStage(targetStageId)
