'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function duplicateFlavor(flavorId: number, newSlug: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Fetch original flavor
  const { data: original, error: fetchError } = await supabase
    .from('humor_flavors')
    .select('*')
    .eq('id', flavorId)
    .single()

  if (fetchError || !original) return { error: 'Flavor not found' }

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from('humor_flavors')
    .select('id')
    .eq('slug', newSlug)
    .maybeSingle()

  if (existing) return { error: 'A flavor with that slug already exists' }

  // Create new flavor
  const { data: newFlavor, error: insertError } = await supabase
    .from('humor_flavors')
    .insert({
      slug: newSlug,
      description: original.description,
      is_pinned: false,
      created_by_user_id: user.id,
      modified_by_user_id: user.id,
    })
    .select()
    .single()

  if (insertError || !newFlavor) return { error: insertError?.message || 'Failed to create flavor' }

  // Fetch original steps and copy them
  const { data: steps } = await supabase
    .from('humor_flavor_steps')
    .select('*')
    .eq('humor_flavor_id', flavorId)
    .order('order_by', { ascending: true })

  if (steps && steps.length > 0) {
    const { error: stepsError } = await supabase
      .from('humor_flavor_steps')
      .insert(
        steps.map(step => ({
          humor_flavor_id: newFlavor.id,
          order_by: step.order_by,
          humor_flavor_step_type_id: step.humor_flavor_step_type_id,
          llm_model_id: step.llm_model_id,
          llm_input_type_id: step.llm_input_type_id,
          llm_output_type_id: step.llm_output_type_id,
          llm_temperature: step.llm_temperature,
          llm_system_prompt: step.llm_system_prompt,
          llm_user_prompt: step.llm_user_prompt,
          description: step.description,
          created_by_user_id: user.id,
          modified_by_user_id: user.id,
        }))
      )

    if (stepsError) return { error: stepsError.message }
  }

  revalidatePath('/admin/humor-flavors')
  return { success: true, data: newFlavor, stepsCopied: steps?.length ?? 0 }
}
