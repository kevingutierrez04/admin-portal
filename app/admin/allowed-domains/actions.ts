'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createDomain(formData: FormData) {
  const supabase = await createClient()

  const apexDomain = formData.get('apex_domain') as string

  console.log('Creating domain:', { apexDomain })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('allowed_signup_domains')
    .insert({ apex_domain: apexDomain, created_by_user_id: user.id, modified_by_user_id: user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating domain:', error)
    return { error: error.message }
  }

  console.log('Domain created successfully:', data)
  revalidatePath('/admin/allowed-domains')
  return { success: true, data }
}

export async function deleteDomain(domainId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('allowed_signup_domains')
    .delete()
    .eq('id', domainId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/allowed-domains')
  return { success: true }
}