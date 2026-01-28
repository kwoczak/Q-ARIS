'use server'

import { createClient } from '@/lib/supabase/server';
import { hashPassword, getSession } from '@/lib/auth-lib';
import { revalidatePath } from 'next/cache';
import { validatePassword } from '@/lib/password-utils';
import { sanitizeInput, validateUsername } from '@/lib/input-validation';

export async function createCuratorAction(formData: FormData) {
    const supabase = await createClient();
    const session = await getSession();

    if (!session || session.role !== 'museum') {
        return { error: 'Unauthorized' };
    }

    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // 0. Sanitize & Validate Inputs
    const cleanUsername = sanitizeInput(username, 50);
    const cleanPassword = sanitizeInput(password, 72);

    if (!cleanUsername || !cleanPassword) {
        return { error: 'Username and password required' };
    }

    const usernameValidation = validateUsername(cleanUsername);
    if (!usernameValidation.isValid) {
        return { error: usernameValidation.error };
    }

    const validation = validatePassword(cleanPassword);
    if (!validation.isValid) {
        return { error: 'Password does not meet complexity requirements: ' + validation.errors.join(', ') };
    }

    // 1. Check License Limits
    // Fetch license for this museum
    const { data: license, error: licenseError } = await supabase
        .from('licenses')
        .select('max_seats, expires_at')
        .eq('museum_id', session.userId)
        .single();

    if (licenseError || !license) {
        return { error: 'License not found' };
    }

    // Check expiry
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
        return { error: 'License expired. Cannot add new curators.' };
    }

    // Count current curators
    const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('museum_id', session.userId)
        .eq('role', 'curator');

    if (countError) return { error: countError.message };

    if ((count || 0) >= license.max_seats) {
        return { error: `Seat limit reached (${count}/${license.max_seats}). Upgrade your license to add more curators.` };
    }

    // 2. Create Curator
    const passwordHash = await hashPassword(cleanPassword);

    const { error: createError } = await supabase
        .from('users')
        .insert({
            username: cleanUsername,
            password_hash: passwordHash,
            role: 'curator',
            museum_id: session.userId,
            created_by: session.userId
        });

    if (createError) return { error: createError.message };

    revalidatePath('/museum');
    return { success: true };
}

export async function deleteCuratorAction(curatorId: string) {
    const supabase = await createClient();
    const session = await getSession();

    if (!session || session.role !== 'museum') {
        return { error: 'Unauthorized' };
    }

    // Verify the curator belongs to this museum before deleting regarding security
    const { data: curator } = await supabase.from('users').select('museum_id').eq('id', curatorId).single();

    if (!curator || curator.museum_id !== session.userId) {
        return { error: 'Unauthorized action on this user.' };
    }

    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', curatorId);

    if (error) return { error: error.message };

    revalidatePath('/museum');
    return { success: true };
}

export async function updateCuratorAction(formData: FormData) {
    const supabase = await createClient();
    const session = await getSession();

    if (!session || session.role !== 'museum') {
        return { error: 'Unauthorized' };
    }

    const curatorId = formData.get('curatorId') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // Verify ownership
    const { data: curator } = await supabase.from('users').select('museum_id').eq('id', curatorId).single();

    if (!curator || curator.museum_id !== session.userId) {
        return { error: 'Unauthorized action on this user.' };
    }

    const updates: any = {};
    if (username) {
        const cleanUsername = sanitizeInput(username, 50);
        const usernameValidation = validateUsername(cleanUsername);
        if (!usernameValidation.isValid) return { error: usernameValidation.error };
        updates.username = cleanUsername;
    }

    if (password && password.trim() !== '') {
        const cleanPassword = sanitizeInput(password, 72);
        const validation = validatePassword(cleanPassword);
        if (!validation.isValid) {
            return { error: 'Password does not meet complexity requirements: ' + validation.errors.join(', ') };
        }
        updates.password_hash = await hashPassword(cleanPassword);
    }

    if (Object.keys(updates).length > 0) {
        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', curatorId);

        if (error) return { error: error.message };
    }

    revalidatePath('/museum');
    return { success: true };
}
