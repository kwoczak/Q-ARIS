import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const STORY_ID = 'acd62f8e-9a71-4413-8b17-c8cd86a7e7c7';

async function generateStats() {
  console.log('Fetching stages for story:', STORY_ID);
  
  const { data: stages, error: stagesError } = await supabase
    .from('stages')
    .select('id, title')
    .eq('story_id', STORY_ID);

  if (stagesError) {
    console.error('Error fetching stages:', stagesError);
    return;
  }

  if (!stages || stages.length === 0) {
    console.log('No stages found for this story.');
    return;
  }

  console.log('Found stages:', stages.map(s => s.title).join(', '));

  const events = [];
  const now = new Date();
  
  // Generate a bunch of sessions over the last 30 days
  const sessionCount = 150;
  
  for (let i = 0; i < sessionCount; i++) {
    const sessionId = `demo-session-${Math.random().toString(36).substring(7)}`;
    const daysAgo = Math.floor(Math.random() * 30);
    const sessionDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 24 * 60 * 60 * 1000);
    
    // Most users see Rembrandt (first node)
    if (Math.random() > 0.1) {
       const rembrandt = stages.find(s => s.title.toLowerCase().includes('rembrandt'));
       if (rembrandt) {
         events.push({
           story_id: STORY_ID,
           stage_id: rembrandt.id,
           event_type: 'stage_view',
           visitor_session_id: sessionId,
           metadata: { duration: Math.floor(Math.random() * 60) + 10 },
           created_at: sessionDate.toISOString()
         });
       }
    }
    
    // Fewer see Voyager
    if (Math.random() > 0.3) {
       const voyager = stages.find(s => s.title.toLowerCase().includes('voyager'));
       if (voyager) {
         events.push({
           story_id: STORY_ID,
           stage_id: voyager.id,
           event_type: 'stage_view',
           visitor_session_id: sessionId,
           metadata: { duration: Math.floor(Math.random() * 120) + 20 },
           created_at: new Date(sessionDate.getTime() + 60000).toISOString()
         });
       }
    }
    
    // Even fewer see Nadia Markiewicz
    if (Math.random() > 0.5) {
       const nadia = stages.find(s => s.title.toLowerCase().includes('nadia'));
       if (nadia) {
         events.push({
           story_id: STORY_ID,
           stage_id: nadia.id,
           event_type: 'stage_view',
           visitor_session_id: sessionId,
           metadata: { duration: Math.floor(Math.random() * 90) + 15 },
           created_at: new Date(sessionDate.getTime() + 150000).toISOString()
         });
       }
    }
    
    // Fewest see THE WOMAN QUESTION
    if (Math.random() > 0.7) {
       const woman = stages.find(s => s.title.toLowerCase().includes('woman'));
       if (woman) {
         events.push({
           story_id: STORY_ID,
           stage_id: woman.id,
           event_type: 'stage_view',
           visitor_session_id: sessionId,
           metadata: { duration: Math.floor(Math.random() * 200) + 30 },
           created_at: new Date(sessionDate.getTime() + 300000).toISOString()
         });
       }
    }
  }

  console.log(`Inserting ${events.length} events...`);
  
  // Insert in batches of 100
  for (let i = 0; i < events.length; i += 100) {
    const batch = events.slice(i, i + 100);
    const { error: insertError } = await supabase
      .from('analytics_events')
      .insert(batch);
      
    if (insertError) {
      console.error('Error inserting events:', insertError);
    } else {
      console.log(`Inserted batch ${i/100 + 1}`);
    }
  }
  
  console.log('Done generating stats!');
}

generateStats();
