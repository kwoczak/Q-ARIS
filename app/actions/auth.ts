'use server'

import { createClient } from '@/lib/supabase/server';
import { comparePassword, createSession, clearSession } from '@/lib/auth-lib';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
        return { error: 'Username and password are required' };
    }

    const supabase = await createClient();

    // 1. Fetch user
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (error || !user) {
        return { error: 'Invalid credentials' };
    }

    // 2. Verify password
    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
        return { error: 'Invalid credentials' };
    }

    // 2.5 Check License Expiration
    let licenseOwnerId = user.id; // If museum, check self
    if (user.role === 'curator') {
        licenseOwnerId = user.museum_id!; // If curator, check museum
    }

    if (user.role === 'museum' || user.role === 'curator') {
        const { data: license } = await supabase
            .from('licenses')
            .select('expires_at')
            .eq('museum_id', licenseOwnerId)
            .single();

        if (license?.expires_at && new Date(license.expires_at) < new Date()) {
            return { error: 'Account license has expired. Please contact support.' };
        }
    }

    // 3. Create Session
    await createSession(user.id, user.role, user.museum_id, user.username);

    // 4. Redirect based on role
    if (user.role === 'admin') {
        redirect('/admin');
    } else if (user.role === 'museum') {
        redirect('/museum');
    } else if (user.role === 'curator') {
        redirect('/curator');
    } else {
        redirect('/');
    }
}

export async function logout() {
    await clearSession();
    redirect('/login');
}
