import { createClient } from '@supabase/supabase-js'

/**
 * Helper para obter cliente Supabase configurado
 * Usa variáveis de ambiente do Vercel/Next.js
 *
 * Variáveis necessárias:
 * - NEXT_PUBLIC_SUPABASE_URL: URL do projeto Supabase
 * - SUPABASE_SERVICE_ROLE_KEY: Chave de serviço (para operações server-side)
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Chave anônima (fallback)
 */
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Configuração do Supabase ausente!')
    console.error('Variáveis necessárias:')
    console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
    console.error('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗')
    console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗')

    throw new Error('Configuração do Supabase ausente. Verifique as variáveis de ambiente no Vercel.')
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/**
 * Verifica se o Supabase está configurado corretamente
 */
export function isSupabaseConfigured() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return !!(supabaseUrl && supabaseKey)
}

/**
 * Retorna mensagem de erro amigável quando Supabase não está configurado
 */
export function getSupabaseErrorMessage() {
  return {
    error: 'Configuração do Supabase ausente',
    message: 'As variáveis de ambiente do Supabase não estão configuradas. Verifique no Vercel.',
    required_vars: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY)'
    ],
    guide: 'Acesse https://vercel.com/seu-projeto/settings/environment-variables'
  }
}
