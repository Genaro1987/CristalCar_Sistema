import { createClient } from '@supabase/supabase-js'
import { normalizarDadosParceiro } from '@/lib/text-utils'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Configuração do Supabase ausente. Defina NEXT_PUBLIC_SUPABASE_URL e a chave (service ou anon).')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id')

    const query = supabase.from('par_parceiros').select('*')

    if (empresaId) {
      query.or(`empresa_id.eq.${Number(empresaId)},empresa_id.is.null`)
    }

    const { data, error } = await query.order('status', { ascending: false }).order('nome_fantasia', { ascending: true })
    if (error) throw error

    return Response.json(data || [])
  } catch (error) {
    console.error('Erro ao buscar parceiros:', error)
    return Response.json({ error: 'Erro ao buscar parceiros' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const normalizedData = normalizarDadosParceiro(data)

    const codigo_unico = normalizedData.codigo_unico || normalizedData.codigo || `PAR${Date.now()}`

    const payload = {
      codigo_unico,
      codigo: normalizedData.codigo || null,
      tipo_pessoa: normalizedData.tipo_pessoa || 'JURIDICA',
      tipo_parceiro: normalizedData.tipo_parceiro || normalizedData.tipo || 'CLIENTE',
      nome_fantasia: normalizedData.nome_fantasia || null,
      razao_social: normalizedData.razao_social || null,
      nome_completo: normalizedData.nome_completo || normalizedData.nome || null,
      cnpj: normalizedData.cnpj || (normalizedData.tipo_pessoa === 'JURIDICA' ? normalizedData.cpf_cnpj : null),
      cpf: normalizedData.cpf || (normalizedData.tipo_pessoa === 'FISICA' ? normalizedData.cpf_cnpj : null),
      cpf_cnpj: normalizedData.cpf_cnpj || null,
      inscricao_estadual: normalizedData.inscricao_estadual || normalizedData.ie_rg || null,
      inscricao_municipal: normalizedData.inscricao_municipal || null,
      rg_inscricao_estadual: normalizedData.rg || null,
      email: normalizedData.email || null,
      telefone: normalizedData.telefone || null,
      celular: normalizedData.celular || null,
      website: normalizedData.website || normalizedData.site || null,
      site: normalizedData.site || normalizedData.website || null,
      cep: normalizedData.cep || null,
      endereco: normalizedData.endereco || null,
      numero: normalizedData.numero || null,
      complemento: normalizedData.complemento || null,
      bairro: normalizedData.bairro || null,
      cidade: normalizedData.cidade || null,
      estado: normalizedData.estado || null,
      banco: normalizedData.banco || null,
      agencia: normalizedData.agencia || null,
      conta: normalizedData.conta || null,
      tipo_conta: normalizedData.tipo_conta || null,
      pix_chave: normalizedData.pix_chave || normalizedData.pix || null,
      pix_tipo: normalizedData.pix_tipo || null,
      empresa_id: normalizedData.empresa_id || null,
      limite_credito: normalizedData.limite_credito || 0,
      observacoes: normalizedData.observacoes || null,
      status: normalizedData.status || (normalizedData.ativo ? 'ATIVO' : 'INATIVO'),
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    }

    const { data: inserted, error } = await supabase
      .from('par_parceiros')
      .insert(payload)
      .select('id')
      .single()

    if (error) throw error

    return Response.json({ success: true, id: inserted?.id })
  } catch (error) {
    console.error('Erro ao criar parceiro:', error)
    return Response.json({ error: 'Erro ao criar parceiro' }, { status: 500 })
  }
}
