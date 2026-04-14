'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createImage(formData: FormData) {
  const supabase = await createClient()

  const url = formData.get('url') as string
  const description = formData.get('description') as string
  const isPublic = formData.get('is_public') === 'true'
  const isCommonUse = formData.get('is_common_use') === 'true'

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('images')
    .insert({
      url,
      image_description: description,
      is_public: isPublic,
      is_common_use: isCommonUse,
      profile_id: user.id,
      created_by_user_id: user.id,
      modified_by_user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/images')
  return { success: true, data }
}

export async function updateImage(imageId: string, formData: FormData) {
  const supabase = await createClient()

  const url = formData.get('url') as string
  const description = formData.get('description') as string
  const isPublic = formData.get('is_public') === 'true'
  const isCommonUse = formData.get('is_common_use') === 'true'

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('images')
    .update({
      url,
      image_description: description,
      is_public: isPublic,
      is_common_use: isCommonUse,
      modified_by_user_id: user.id,
    })
    .eq('id', imageId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/images')
  return { success: true, data }
}

export async function deleteImage(imageId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('images').delete().eq('id', imageId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/images')
  return { success: true }
}
