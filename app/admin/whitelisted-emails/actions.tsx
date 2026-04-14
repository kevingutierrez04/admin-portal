'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWhitelistedEmail(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email_address') as string

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('whitelist_email_addresses')
    .insert({ email_address: email, created_by_user_id: user.id, modified_by_user_id: user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating whitelisted email:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/whitelisted-emails')
  return { success: true, data }
}

export async function deleteWhitelistedEmail(emailId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('whitelist_email_addresses')
    .delete()
    .eq('id', emailId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/whitelisted-emails')
  return { success: true }
}