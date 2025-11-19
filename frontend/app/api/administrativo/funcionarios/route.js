import { getSupabaseClient, isSupabaseConfigured, getSupabaseErrorMessage } from '@/lib/supabase'
import { normalizarTexto } from '@/lib/text-utils'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json(getSupabaseErrorMessage(), { status: 500 })
    }

    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id')

    let query = supabase
      .from('adm_funcionarios')
      .select('*')
      .order('nome_completo', { ascending: true })

    if (empresaId) {
      query = query.or(`empresa_id.eq.${empresaId},empresa_id.is.null`)
    }

    const { data, error } = await query

    if (error) throw error

    return Response.json(data || [])
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error)
    return Response.json({ error: 'Erro ao buscar funcionários: ' + error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json(getSupabaseErrorMessage(), { status: 500 })
    }

    const supabase = getSupabaseClient()
    const data = await request.json()

    // Normalizar campos de texto
    const payload = {
      codigo_unico: data.codigo_unico || null,
      nome_completo: normalizarTexto(data.nome_completo),
      cpf: data.cpf || null,
      rg: data.rg || null,
      data_nascimento: data.data_nascimento || null,
      telefone: data.telefone || null,
      celular: data.celular || null,
      email: data.email?.toLowerCase() || null,
      endereco: data.endereco ? normalizarTexto(data.endereco) : null,
      cidade: data.cidade ? normalizarTexto(data.cidade) : null,
      estado: data.estado || null,
      cep: data.cep || null,
      cargo: data.cargo ? normalizarTexto(data.cargo) : null,
      departamento_id: data.departamento_id || null,
      data_admissao: data.data_admissao || null,
      data_demissao: data.data_demissao || null,
      salario: data.salario || null,
      status: data.status || 'ATIVO',
      observacoes: data.observacoes ? normalizarTexto(data.observacoes) : null,
      empresa_id: data.empresa_id || null,
    }

    const { data: inserted, error } = await supabase
      .from('adm_funcionarios')
      .insert(payload)
      .select('id')
      .single()

    if (error) throw error

    return Response.json({ success: true, id: inserted.id })
  } catch (error) {
    console.error('Erro ao criar funcionário:', error)
    return Response.json({ error: 'Erro ao criar funcionário: ' + error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json(getSupabaseErrorMessage(), { status: 500 })
    }

    const supabase = getSupabaseClient()
    const data = await request.json()

    if (!data.id) {
      return Response.json({ error: 'ID não fornecido' }, { status: 400 })
    }

    const payload = {}

    if (data.nome_completo) payload.nome_completo = normalizarTexto(data.nome_completo)
    if (data.cpf !== undefined) payload.cpf = data.cpf
    if (data.rg !== undefined) payload.rg = data.rg
    if (data.data_nascimento !== undefined) payload.data_nascimento = data.data_nascimento
    if (data.telefone !== undefined) payload.telefone = data.telefone
    if (data.celular !== undefined) payload.celular = data.celular
    if (data.email !== undefined) payload.email = data.email?.toLowerCase()
    if (data.endereco !== undefined) payload.endereco = data.endereco ? normalizarTexto(data.endereco) : null
    if (data.cidade !== undefined) payload.cidade = data.cidade ? normalizarTexto(data.cidade) : null
    if (data.estado !== undefined) payload.estado = data.estado
    if (data.cep !== undefined) payload.cep = data.cep
    if (data.cargo !== undefined) payload.cargo = data.cargo ? normalizarTexto(data.cargo) : null
    if (data.departamento_id !== undefined) payload.departamento_id = data.departamento_id
    if (data.data_admissao !== undefined) payload.data_admissao = data.data_admissao
    if (data.data_demissao !== undefined) payload.data_demissao = data.data_demissao
    if (data.salario !== undefined) payload.salario = data.salario
    if (data.status) payload.status = data.status
    if (data.observacoes !== undefined) payload.observacoes = data.observacoes ? normalizarTexto(data.observacoes) : null

    payload.atualizado_em = new Date().toISOString()

    const { error } = await supabase
      .from('adm_funcionarios')
      .update(payload)
      .eq('id', data.id)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error)
    return Response.json({ error: 'Erro ao atualizar funcionário: ' + error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json(getSupabaseErrorMessage(), { status: 500 })
    }

    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'ID não fornecido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('adm_funcionarios')
      .delete()
      .eq('id', id)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir funcionário:', error)
    return Response.json({ error: 'Erro ao excluir funcionário: ' + error.message }, { status: 500 })
  }
}
