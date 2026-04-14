'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateHumorMix(mixId: number, captionCount: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('humor_flavor_mix')
    .update({ caption_count: captionCount, modified_by_user_id: user.id })
    .eq('id', mixId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/humor-mix')
  return { success: true, data }
}