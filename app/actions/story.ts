'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createStory(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!title) {
        throw new Error('Title is required')
    }

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('stories')
        .insert({ title, description })
        .select()
        .single()

    if (error) {
        console.error('Error creating story:', error)
        // For demo purposes, we might want to return the error to the client,
        // but redirecting inside try/catch or handling generic error is fine for MVP.
        throw new Error(error.message)
    }

    redirect(`/admin/story/${data.id}`)
}

export async function deleteStory(id: string) {
    const supabase = await createClient()

    // Deleting story will cascade delete stages and triggers if FK is set up correctly
    // or we might need explicit deletes depending on schema.
    // Our schema has 'on delete cascade', so deleting story is enough.

    const { error } = await supabase.from('stories').delete().eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    // Next.js cache revalidation happens automatically for server actions usually 
    // but explicit revalidatePath is good practice if needed.
    // However, since we are listed in /admin, we assume page reload or revalidation happens.
}
