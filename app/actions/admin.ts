'use server'
// Rebuild trigger

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { hashPassword, getSession } from '@/lib/auth-lib';
import { revalidatePath } from 'next/cache';
import { createLicense } from '@/lib/users';
import { validatePassword } from '@/lib/password-utils';
import { sanitizeInput, validateUsername } from '@/lib/input-validation';

export async function createMuseumAction(formData: FormData) {
    const supabase = await createClient();
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const maxSeats = parseInt(formData.get('maxSeats') as string) || 3;
    const adminId = formData.get('adminId') as string;

    // 1. Sanitize Inputs
    const cleanUsername = sanitizeInput(username, 50);
    // Limit password length to avoid potential DoS with long strings in bcrypt
    const cleanPassword = sanitizeInput(password, 72);

    if (!cleanUsername || !cleanPassword) {
        return { error: 'Username and password required' };
    }

    // 2. Validate Username format
    const usernameValidation = validateUsername(cleanUsername);
    if (!usernameValidation.isValid) {
        return { error: usernameValidation.error };
    }

    // 3. Validate Password Complexity
    const validation = validatePassword(cleanPassword);
    if (!validation.isValid) {
        return { error: 'Password does not meet complexity requirements: ' + validation.errors.join(', ') };
    }



    // Create User
    const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
            username: cleanUsername,
            password_hash: await hashPassword(cleanPassword),
            role: 'museum',
            created_by: adminId
        })
        .select()
        .single();

    if (userError) return { error: userError.message };

    // Create License
    try {
        const expiryDetails = formData.get('expiresAt') as string;
        const expiresAt = expiryDetails ? new Date(expiryDetails) : null;
        await createLicense(user.id, maxSeats, expiresAt);
    } catch (e: any) {
        return { error: 'User created but license failed: ' + e.message };
    }

    revalidatePath('/admin');
    return { success: true };
}

export async function updateMuseumAction(formData: FormData) {
    const supabase = await createClient();
    const museumId = formData.get('museumId') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const updates: any = {};

    // 1. Username Update
    if (username) {
        const cleanUsername = sanitizeInput(username, 50);
        const usernameValidation = validateUsername(cleanUsername);
        if (!usernameValidation.isValid) return { error: usernameValidation.error };

        // Check uniqueness if changed
        // (Supabase unique constraint handles this, but a nicer error is better)
        // We'll rely on DB constraint for now or could query.
        updates.username = cleanUsername;
    }

    // 2. Password Update
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
            .eq('id', museumId)
            .eq('role', 'museum'); // Security check

        if (error) {
            if (error.code === '23505') return { error: 'Username already taken' };
            return { error: error.message };
        }
    }

    revalidatePath('/admin');
    return { success: true };
}

export async function updateAdminProfileAction(formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return { error: 'Unauthorized' };
    }

    const supabase = await createClient();
    const userId = session.userId;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const updates: any = {};

    // 1. Username Update
    if (username) {
        const cleanUsername = sanitizeInput(username, 50);
        const usernameValidation = validateUsername(cleanUsername);
        if (!usernameValidation.isValid) return { error: usernameValidation.error };
        updates.username = cleanUsername;
    }

    // 2. Password Update
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
            .eq('id', userId);

        if (error) {
            if (error.code === '23505') return { error: 'Username already taken' };
            return { error: error.message };
        }
    }

    revalidatePath('/admin');
    return { success: true };
}





export async function deleteMuseumAction(museumId: string) {
    // Use Admin Client to bypass RLS for cascading deletes
    const supabase = await createAdminClient();

    // 1. Get associated curators
    const { data: curators } = await supabase
        .from('users')
        .select('id')
        .eq('museum_id', museumId);

    // 2. Delete Stories assigned to these curators (Manual Cascade)
    if (curators && curators.length > 0) {
        const curatorIds = curators.map(c => c.id);
        const { error: storiesError } = await supabase
            .from('stories')
            .delete()
            .in('curator_id', curatorIds);

        if (storiesError) {
            console.error("Error deleting stories:", storiesError);
            return { error: 'Failed to delete dependencies (stories): ' + storiesError.message };
        }
    }

    // 3. Delete Curators
    const { error: curatorError } = await supabase
        .from('users')
        .delete()
        .eq('museum_id', museumId);

    if (curatorError) {
        console.error("Error deleting curators:", curatorError);
        return { error: 'Failed to delete associated curators: ' + curatorError.message };
    }

    // 4. Delete the museum user
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', museumId);

    if (error) return { error: error.message };
    revalidatePath('/admin');
    return { success: true };
}

export async function updateLicenseAction(formData: FormData) {
    const supabase = await createClient();
    const museumId = formData.get('museumId') as string;
    const maxSeats = parseInt(formData.get('maxSeats') as string);


    // Get current license first to check if exists or update
    const { data: currentLicense } = await supabase.from('licenses').select('*').eq('museum_id', museumId).single();

    // Parse expiry date from form (if provided)
    const expiryDetails = formData.get('expiresAt') as string;
    const newExpiresAt = expiryDetails ? new Date(expiryDetails) : null;

    if (currentLicense) {
        await supabase.from('licenses').update({
            max_seats: maxSeats,
            expires_at: newExpiresAt ? newExpiresAt.toISOString() : currentLicense.expires_at // Keep old if not provided? Or just require it? UI will likely require it.
        }).eq('id', currentLicense.id);

    } else {
        // Create if missing
        const expiresAt = newExpiresAt || new Date(new Date().setFullYear(new Date().getFullYear() + 1));

        await supabase.from('licenses').insert({
            museum_id: museumId,
            max_seats: maxSeats,
            expires_at: expiresAt.toISOString()
        });
    }

    revalidatePath('/admin');
}
