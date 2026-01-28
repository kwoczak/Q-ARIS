
import { createClient } from '@/lib/supabase/server';
import { hashPassword } from '@/lib/auth-lib';

export type UserRole = 'admin' | 'museum' | 'curator';

export async function createUser(
    username: string,
    role: UserRole,
    parentId: string | null = null,
    museumId: string | null = null
) {
    const supabase = await createClient();

    // 1. Generate password (for now, we set same as username or random?)
    // User asked: "podaj mi do nich loginy i hasła" (give me logins and passwords)
    // I will assume password = username for simplicity in this generated setup, or 'pass123'.
    const rawPassword = 'password123';
    const hashedPassword = await hashPassword(rawPassword);

    const { data, error } = await supabase
        .from('users')
        .insert({
            username,
            password_hash: hashedPassword,
            role,
            created_by: parentId,
            museum_id: museumId
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating user:', error);
        throw new Error(error.message);
    }

    return { user: data, password: rawPassword };
}

export async function createLicense(museumId: string, maxSeats: number = 3, expiresAt: Date | null = null) {
    const supabase = await createClient();

    if (!expiresAt) {
        expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year default
    }

    const { data, error } = await supabase
        .from('licenses')
        .insert({
            museum_id: museumId,
            max_seats: maxSeats,
            expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function assignCuratorToStory(storyId: string, curatorId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('stories')
        .update({ curator_id: curatorId })
        .eq('id', storyId);

    if (error) throw error;
}
