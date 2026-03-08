'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProvider(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string

  console.log('Creating provider:', { name })

  const { data, error } = await supabase
    .from('llm_providers')
    .insert({
      name,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating provider:', error)
    return { error: error.message }
  }

  console.log('Provider created successfully:', data)
  revalidatePath('/admin/llm-providers')
  return { success: true, data }
}

export async function updateProvider(providerId: number, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string

  const { data, error } = await supabase
    .from('llm_providers')
    .update({
      name,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq('id', providerId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/llm-providers')
  return { success: true, data }
}

export async function deleteProvider(providerId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('llm_providers')
    .delete()
    .eq('id', providerId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/llm-providers')
  return { success: true }
}