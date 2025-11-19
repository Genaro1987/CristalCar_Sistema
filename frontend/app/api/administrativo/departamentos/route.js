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
    const status = searchParams.get('status')

    let query = supabase
      .from('adm_departamentos')
      .select('*')
      .order('nome', { ascending: true })

    if (empresaId) {
      query = query.or(`empresa_id.eq.${empresaId},empresa_id.is.null`)
    }

    if (status) {
      query = query.eq('status', status)
    } else {
      query = query.neq('status', 'INATIVO')
    }

    const { data, error } = await query

    if (error) throw error

    return Response.json(data || [])
  } catch (error) {
    console.error('Erro ao buscar departamentos:', error)
    return Response.json({ error: 'Erro ao buscar departamentos: ' + error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json(getSupabaseErrorMessage(), { status: 500 })
    }

    const supabase = getSupabaseClient()
    const data = await request.json()

    // Gerar código sequencial se não fornecido
    let codigo = data.codigo
    if (!codigo) {
      const { data: ultimoCodigo } = await supabase
        .from('adm_departamentos')
        .select('codigo')
        .like('codigo', 'DEP-%')
        .order('codigo', { ascending: false })
        .limit(1)

      if (ultimoCodigo && ultimoCodigo.length > 0) {
        const ultimoNumero = parseInt(ultimoCodigo[0].codigo.split('-')[1]) || 0
        codigo = `DEP-${String(ultimoNumero + 1).padStart(3, '0')}`
      } else {
        codigo = 'DEP-001'
      }
    }

    const payload = {
      codigo: normalizarTexto(codigo),
      nome: normalizarTexto(data.nome),
      descricao: data.descricao || null,
      responsavel_id: data.responsavel_id || null,
      empresa_id: data.empresa_id || null,
      status: data.status || 'ATIVO',
    }

    const { data: inserted, error } = await supabase
      .from('adm_departamentos')
      .insert(payload)
      .select('id, codigo')
      .single()

    if (error) throw error

    return Response.json({ success: true, id: inserted.id, codigo: inserted.codigo })
  } catch (error) {
    console.error('Erro ao criar departamento:', error)
    return Response.json({ error: 'Erro ao criar departamento: ' + error.message }, { status: 500 })
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

    const payload = {
      atualizado_em: new Date().toISOString(),
    }

    if (data.nome) payload.nome = normalizarTexto(data.nome)
    if (data.descricao !== undefined) payload.descricao = data.descricao
    if (data.responsavel_id !== undefined) payload.responsavel_id = data.responsavel_id || null
    if (data.status) payload.status = data.status

    const { error } = await supabase
      .from('adm_departamentos')
      .update(payload)
      .eq('id', data.id)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar departamento:', error)
    return Response.json({ error: 'Erro ao atualizar departamento: ' + error.message }, { status: 500 })
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

    // Verificar se existe
    const { data: departamento } = await supabase
      .from('adm_departamentos')
      .select('id, nome')
      .eq('id', id)
      .single()

    if (!departamento) {
      return Response.json({ error: 'Departamento não encontrado' }, { status: 404 })
    }

    // Verificar se tem funcionários vinculados
    const { data: funcionarios, error: funcError } = await supabase
      .from('adm_funcionarios')
      .select('id', { count: 'exact', head: true })
      .eq('departamento_id', id)

    if (funcError && !funcError.message.includes('does not exist')) {
      throw funcError
    }

    if (funcionarios && funcionarios.length > 0) {
      return Response.json({
        error: 'Não é possível excluir departamento com funcionários vinculados'
      }, { status: 400 })
    }

    // Excluir
    const { error } = await supabase
      .from('adm_departamentos')
      .delete()
      .eq('id', id)

    if (error) throw error

    return Response.json({ success: true, id: Number(id) })
  } catch (error) {
    console.error('Erro ao excluir departamento:', error)
    return Response.json({ error: 'Erro ao excluir departamento: ' + error.message }, { status: 500 })
  }
}
