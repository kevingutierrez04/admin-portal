'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateHumorMix(mixId: number, captionCount: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('humor_flavor_mix')
    .update({ caption_count: captionCount })
    .eq('id', mixId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/humor-mix')
  return { success: true, data }
}