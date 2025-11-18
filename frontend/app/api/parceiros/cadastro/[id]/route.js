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

export async function PUT(request, { params }) {
  try {
    const data = await request.json()
    const { id } = params

    const normalizedData = normalizarDadosParceiro(data)

    const payload = {
      tipo_parceiro: normalizedData.tipo_parceiro || normalizedData.tipo || 'CLIENTE',
      tipo_pessoa: normalizedData.tipo_pessoa || 'JURIDICA',
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
      limite_credito: normalizedData.limite_credito || 0,
      observacoes: normalizedData.observacoes || null,
      status: normalizedData.status || (normalizedData.ativo ? 'ATIVO' : 'INATIVO'),
      atualizado_em: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('par_parceiros')
      .update(payload)
      .eq('id', Number(id))

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar parceiro:', error)
    return Response.json({ error: 'Erro ao atualizar parceiro' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    const { count: vendasCount, error: vendasError } = await supabase
      .from('mov_vendas')
      .select('id', { count: 'exact', head: true })
      .eq('parceiro_id', Number(id))
    if (vendasError) throw vendasError

    const { count: comprasCount, error: comprasError } = await supabase
      .from('mov_compras')
      .select('id', { count: 'exact', head: true })
      .eq('parceiro_id', Number(id))
    if (comprasError) throw comprasError

    if ((vendasCount || 0) > 0 || (comprasCount || 0) > 0) {
      return Response.json(
        { error: 'Não é possível excluir. Este parceiro está sendo usado em vendas ou compras.' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('par_parceiros')
      .delete()
      .eq('id', Number(id))

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir parceiro:', error)
    return Response.json({ error: 'Erro ao excluir parceiro' }, { status: 500 })
  }
}
