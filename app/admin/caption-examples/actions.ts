'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCaptionExample(formData: FormData) {
  const supabase = await createClient()

  const imageDescription = formData.get('image_description') as string
  const caption = formData.get('caption') as string
  const explanation = formData.get('explanation') as string
  const priority = parseInt(formData.get('priority') as string) || 0
  const imageId = formData.get('image_id') as string | null

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('caption_examples')
    .insert({
      image_description: imageDescription,
      caption,
      explanation,
      priority,
      image_id: imageId || null,
      created_by_user_id: user.id,
      modified_by_user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/caption-examples')
  return { success: true, data }
}

export async function updateCaptionExample(exampleId: number, formData: FormData) {
  const supabase = await createClient()

  const imageDescription = formData.get('image_description') as string
  const caption = formData.get('caption') as string
  const explanation = formData.get('explanation') as string
  const priority = parseInt(formData.get('priority') as string) || 0
  const imageId = formData.get('image_id') as string | null

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('caption_examples')
    .update({
      image_description: imageDescription,
      caption,
      explanation,
      priority,
      image_id: imageId || null,
      modified_by_user_id: user.id,
    })
    .eq('id', exampleId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/caption-examples')
  return { success: true, data }
}

export async function deleteCaptionExample(exampleId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('caption_examples')
    .delete()
    .eq('id', exampleId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/caption-examples')
  return { success: true }
}