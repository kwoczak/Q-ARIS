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
