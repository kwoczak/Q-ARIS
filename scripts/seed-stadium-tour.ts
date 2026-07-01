import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Manually parse .env.local to read supabase credentials
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
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Use anon key since RLS is disabled

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Anon Key in .env.local")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Generate simple UUIDs for blocks
function genId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function run() {
    console.log("Seeding PGE Narodowy Tour for curator_demo...");

    // Find curator_demo in database
    const { data: curator, error: userError } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', 'curator_demo')
        .single();

    if (userError || !curator) {
        console.error("Error: curator_demo user not found in the database. Please ensure setup-auth has been called.");
        process.exit(1);
    }

    console.log(`Found Curator curator_demo (ID: ${curator.id})`);

    // Clean up existing PGE Narodowy stories
    const { data: existingStories } = await supabase
        .from('stories')
        .select('id')
        .eq('title', 'Stadion PGE Narodowy (Wirtualna Wycieczka)');

    if (existingStories && existingStories.length > 0) {
        console.log("Deleting existing PGE Narodowy story for clean re-seeding...");
        for (const story of existingStories) {
            const { error: deleteErr } = await supabase.from('stories').delete().eq('id', story.id);
            if (deleteErr) console.warn("Failed to delete story:", deleteErr.message);
        }
    }

    // Create PGE Narodowy Story
    const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
            title: 'Stadion PGE Narodowy (Wirtualna Wycieczka)',
            description: 'Odkryj fascynujące fakty, architekturę i najważniejsze punkty Stadionu Narodowego w Warszawie. / Discover PGE Narodowy – Poland\'s iconic stadium.',
            curator_id: curator.id,
            supported_languages: ['pl', 'en'],
            default_language: 'pl',
            is_gamified: true
        })
        .select()
        .single();

    if (storyError || !story) {
        console.error("Story Insertion Error:", storyError);
        process.exit(1);
    }

    console.log(`Story created successfully! ID: ${story.id}`);

    // Create 4 Stages
    console.log("Creating stages...");

    // STAGE 1: Welcome & Entrance
    const stage1Content = {
        background: { type: 'color', value: '#0b0f19' },
        blocks: [
            {
                id: genId(),
                type: 'text',
                content: 'Witamy na PGE Narodowym w Warszawie! 🏟️\n\nJest to największa i najnowocześniejsza arena wielofunkcyjna w Polsce, wybudowana na Mistrzostwa Europy w Piłce Nożnej UEFA Euro 2012.\n\nRozpocznij naszą wirtualną podróż, by poznać najciekawsze sekrety tego imponującego obiektu!',
                content_i18n: {
                    en: 'Welcome to PGE Narodowy in Warsaw! 🏟️\n\nIt is the largest and most modern multi-purpose arena in Poland, constructed for the UEFA Euro 2012 football championship.\n\nStart our virtual journey to explore the most fascinating secrets of this impressive venue!'
                },
                styles: { fontSize: 'lg', textAlign: 'center', marginBottom: '1.5rem', fontFamily: 'sans', fontWeight: 'bold' }
            },
            {
                id: genId(),
                type: 'image',
                content: 'https://images.unsplash.com/photo-1599827552599-ead7522d083a?q=80&w=800',
                styles: { borderRadius: '1rem', marginBottom: '1rem' },
                overlay: {
                    text: 'PGE Narodowy nocą / PGE Narodowy at night',
                    position: 'bottom-center',
                    width: 'auto',
                    style: { backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.5rem', backdropBlur: true }
                },
                overlay_i18n: {
                    en: { text: 'PGE Narodowy at night' }
                }
            }
        ]
    };

    const { data: s1, error: s1Err } = await supabase
        .from('stages')
        .insert({
            story_id: story.id,
            title: '01_wejscie_glowne',
            type: 'content',
            content: stage1Content,
            position_x: 100,
            position_y: 100
        })
        .select()
        .single();

    if (s1Err || !s1) {
        console.error("Stage 1 Insertion Error:", s1Err);
        process.exit(1);
    }

    // STAGE 2: Trybuny i Bramy
    const stage2Content = {
        background: { type: 'color', value: '#0f172a' },
        blocks: [
            {
                id: genId(),
                type: 'text',
                content: '🏟️ Układ Trybun i Bram Wejściowych\n\n• Trybuny podzielone są na 4 główne strefy oznaczone kolorami: Czerwony (sektor VIP i loże), Niebieski, Żółty oraz Zielony.\n• Wejście na sektory odbywa się przez bramy wejściowe (Bramy 1-11).\n• Brama nr 1 (od strony Al. Zielenieckiej) to główne wejście dla pieszych i gości VIP.\n• Sektory trybun posiadają przejrzyste oznaczenia numeryczne, ułatwiające znalezienie swojego miejsca.',
                content_i18n: {
                    en: '🏟️ Stands & Entrance Gates Layout\n\n• The stands are divided into 4 main color-coded zones: Red (VIP & Business Boxes), Blue, Yellow, and Green.\n• Access to the seating sectors is through entry gates (Gates 1-11).\n• Gate No. 1 (from Zieleniecka Ave) is the main entrance for pedestrians and VIP guests.\n• Seating sectors have clear numerical designations, making it easy to find your seat.'
                },
                styles: { fontSize: 'base', textAlign: 'left', marginBottom: '1.5rem', fontFamily: 'sans' }
            },
            {
                id: genId(),
                type: 'image',
                content: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800',
                styles: { borderRadius: '1rem' }
            }
        ]
    };

    const { data: s2, error: s2Err } = await supabase
        .from('stages')
        .insert({
            story_id: story.id,
            title: '02_trybuny_i_bramy',
            type: 'content',
            content: stage2Content,
            position_x: 100,
            position_y: 350
        })
        .select()
        .single();

    if (s2Err || !s2) {
        console.error("Stage 2 Insertion Error:", s2Err);
        process.exit(1);
    }

    // STAGE 3: Quiz o iglicy
    const stage3Content = {
        background: { type: 'color', value: '#1e1b4b' },
        blocks: [
            {
                id: genId(),
                type: 'text',
                content: 'Sprawdź swoją wiedzę o PGE Narodowym! 🧠\n\nCzy uważałeś podczas wycieczki? Odpowiedz na poniższe pytanie, aby zdobyć punkty!',
                content_i18n: {
                    en: 'Test your knowledge about PGE Narodowy! 🧠\n\nHave you been paying attention? Answer the question below to score points!'
                },
                styles: { fontSize: 'base', textAlign: 'center', marginBottom: '1.5rem', fontFamily: 'sans', fontWeight: 'bold' }
            },
            {
                id: genId(),
                type: 'quiz',
                content: {
                    question: 'Ile metrów wysokości ma słynna iglica PGE Narodowego, mierząc od poziomu boiska?',
                    points: 20,
                    submitButtonText: 'Zatwierdź',
                    answers: [
                        { id: 'opt_1', text: '50 metrów', isCorrect: false },
                        { id: 'opt_2', text: '70 metrów', isCorrect: false },
                        { id: 'opt_3', text: '100 metrów', isCorrect: true, feedback: 'Brawo! Iglica ma dokładnie 100 metrów wysokości i jest charakterystycznym punktem Warszawy.' }
                    ]
                },
                content_i18n: {
                    en: {
                        question: 'How high is the famous spire of PGE Narodowy, measured from the pitch level?',
                        points: 20,
                        submitButtonText: 'Submit',
                        answers: [
                            { id: 'opt_1', text: '50 meters', isCorrect: false },
                            { id: 'opt_2', text: '70 meters', isCorrect: false },
                            { id: 'opt_3', text: '100 meters', isCorrect: true, feedback: 'Correct! The spire is exactly 100 meters high and is a landmark of the Warsaw skyline.' }
                        ]
                    }
                }
            }
        ]
    };

    const { data: s3, error: s3Err } = await supabase
        .from('stages')
        .insert({
            story_id: story.id,
            title: '03_quiz_iglica',
            type: 'quiz',
            content: stage3Content,
            position_x: 450,
            position_y: 220
        })
        .select()
        .single();

    if (s3Err || !s3) {
        console.error("Stage 3 Insertion Error:", s3Err);
        process.exit(1);
    }

    // STAGE 4: Ending
    const stage4Content = {
        background: { type: 'gradient', value: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)' },
        blocks: [
            {
                id: genId(),
                type: 'text',
                content: '🎉 Gratulacje! Ukończyłeś wirtualną wycieczkę!\n\nPoznałeś najważniejsze fakty, bramy wejściowe oraz układ trybun Stadionu Narodowego. Mamy nadzieję, że teraz z łatwością trafisz na swoje miejsce podczas kolejnego meczu lub koncertu!\n\nŻyczymy udanej dalszej zabawy z platformą Q-ARIS!',
                content_i18n: {
                    en: '🎉 Congratulations! You have completed the virtual tour!\n\nYou have learned the key facts, entrance gates, and seating layout of the National Stadium. We hope you will easily find your way to your seat during the next match or concert!\n\nHave fun exploring more tours with Q-ARIS!'
                },
                styles: { fontSize: 'lg', textAlign: 'center', marginBottom: '1rem', fontFamily: 'sans', fontWeight: 'bold' }
            }
        ]
    };

    const { data: s4, error: s4Err } = await supabase
        .from('stages')
        .insert({
            story_id: story.id,
            title: '04_zakonczenie',
            type: 'ending',
            content: stage4Content,
            position_x: 750,
            position_y: 220
        })
        .select()
        .single();

    if (s4Err || !s4) {
        console.error("Stage 4 Insertion Error:", s4Err);
        process.exit(1);
    }

    console.log("Stages created successfully!");

    // Connect Stages with Edges
    console.log("Connecting stages with edges...");
    const edges = [
        { story_id: story.id, source_stage_id: s1.id, target_stage_id: s2.id },
        { story_id: story.id, source_stage_id: s2.id, target_stage_id: s3.id },
        { story_id: story.id, source_stage_id: s3.id, target_stage_id: s4.id }
    ];

    const { error: edgeErr } = await supabase
        .from('story_edges')
        .insert(edges);

    if (edgeErr) {
        console.error("Edges Insertion Error:", edgeErr);
        process.exit(1);
    }
    console.log("Edges connected successfully!");

    // Create Start Trigger (QR Code) for the entrance
    console.log("Creating trigger (QR Code) for the stadium tour...");
    const triggerCode = 'stadion_narodowy';
    const { data: trigger, error: triggerErr } = await supabase
        .from('triggers')
        .insert({
            code: triggerCode,
            story_id: story.id,
            target_stage_id: s1.id,
            type: 'start'
        })
        .select()
        .single();

    if (triggerErr) {
        console.error("Trigger Insertion Error:", triggerErr);
        process.exit(1);
    }

    console.log(`Trigger created! Code: "${triggerCode}"`);
    console.log(`You can now preview this tour by going to http://localhost:3000/play/${triggerCode}`);
    console.log("Seeding PGE Narodowy completed successfully! 🎉");
}

run().catch(console.error);
