
import { NextResponse } from 'next/server';
import { createUser, createLicense, assignCuratorToStory } from '@/lib/users';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. Check if Admin already exists
        const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin');

        if (count && count > 0) {
            return NextResponse.json({ message: 'Admin already exists. Skipping seed.' }, { status: 200 });
        }

        // 2. Create Admin
        const adminRes = await createUser('admin', 'admin');
        const adminId = adminRes.user.id;

        // 3. Create Museum (Linked to Admin?) - Actually licenses table links museum to system limits.
        // We set created_by = adminId
        const museumRes = await createUser('museum_demo', 'museum', adminId);
        const museumId = museumRes.user.id;

        // 4. Create License for Museum
        await createLicense(museumId, 5);

        // 5. Create Curator (Linked to Museum)
        const curatorRes = await createUser('curator_demo', 'curator', museumId, museumId); // created_by museum, belongs to museum
        const curatorId = curatorRes.user.id;

        // 6. Assign existing story to Curator
        // Find one story
        const { data: stories } = await supabase.from('stories').select('id').limit(1);
        let storyMsg = 'No stories found to assign.';

        if (stories && stories.length > 0) {
            await assignCuratorToStory(stories[0].id, curatorId);
            storyMsg = `Assigned story ${stories[0].id} to curator.`;
        }

        return NextResponse.json({
            message: 'Seed successful',
            story: storyMsg,
            credentials: [
                { role: 'Admin', username: 'admin', password: adminRes.password },
                { role: 'Museum', username: 'museum_demo', password: museumRes.password },
                { role: 'Curator', username: 'curator_demo', password: curatorRes.password }
            ]
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
