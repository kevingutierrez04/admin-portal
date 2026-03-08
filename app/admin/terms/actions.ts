'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTerm(formData: FormData) {
  const supabase = await createClient()

  const term = formData.get('term') as string
  const definition = formData.get('definition') as string
  const example = formData.get('example') as string
  const termTypeId = parseInt(formData.get('term_type_id') as string)

  const { data, error } = await supabase
    .from('terms')
    .insert({
      term,
      definition,
      example,
      term_type_id: termTypeId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating term:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/terms')
  return { success: true, data }
}

export async function updateTerm(termId: number, formData: FormData) {
  const supabase = await createClient()

  const term = formData.get('term') as string
  const definition = formData.get('definition') as string
  const example = formData.get('example') as string
  const termTypeId = parseInt(formData.get('term_type_id') as string)

  const { data, error } = await supabase
    .from('terms')
    .update({
      term,
      definition,
      example,
      term_type_id: termTypeId,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq('id', termId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/terms')
  return { success: true, data }
}

export async function deleteTerm(termId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('terms')
    .delete()
    .eq('id', termId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/terms')
  return { success: true }
}