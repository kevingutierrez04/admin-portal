'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createModel(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const providerModelId = formData.get('provider_model_id') as string
  const llmProviderId = parseInt(formData.get('llm_provider_id') as string)

  console.log('Creating model:', { name, providerModelId, llmProviderId })

  const { data, error } = await supabase
    .from('llm_models')
    .insert({
      name,
      provider_model_id: providerModelId,
      llm_provider_id: llmProviderId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating model:', error)
    return { error: error.message }
  }

  console.log('Model created successfully:', data)
  revalidatePath('/admin/llm-models')
  return { success: true, data }
}

export async function updateModel(modelId: number, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const providerModelId = formData.get('provider_model_id') as string
  const llmProviderId = parseInt(formData.get('llm_provider_id') as string)

  const { data, error } = await supabase
    .from('llm_models')
    .update({
      name,
      provider_model_id: providerModelId,
      llm_provider_id: llmProviderId,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq('id', modelId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/llm-models')
  return { success: true, data }
}

export async function deleteModel(modelId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('llm_models')
    .delete()
    .eq('id', modelId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/llm-models')
  return { success: true }
}