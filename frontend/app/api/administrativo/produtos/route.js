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
    const tipo = searchParams.get('tipo')
    const finalidade = searchParams.get('finalidade')
    const status = searchParams.get('status')

    let query = supabase
      .from('adm_produtos')
      .select('*')
      .order('nome', { ascending: true })

    if (empresaId) {
      query = query.or(`empresa_id.eq.${empresaId},empresa_id.is.null`)
    }

    if (tipo) {
      query = query.eq('tipo', tipo)
    }

    if (finalidade) {
      query = query.or(`finalidade.eq.${finalidade},finalidade.eq.AMBOS`)
    }

    if (status) {
      query = query.eq('status', status)
    } else {
      query = query.eq('status', 'ATIVO')
    }

    const { data, error } = await query

    if (error) throw error

    return Response.json(data || [])
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return Response.json({ error: 'Erro ao buscar produtos: ' + error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json(getSupabaseErrorMessage(), { status: 500 })
    }

    const supabase = getSupabaseClient()
    const data = await request.json()

    if (!data.nome) {
      return Response.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    // Gerar código sequencial se não fornecido
    let codigo = data.codigo
    if (!codigo) {
      const { data: ultimoCodigo } = await supabase
        .from('adm_produtos')
        .select('codigo')
        .like('codigo', 'PROD-%')
        .order('codigo', { ascending: false })
        .limit(1)

      if (ultimoCodigo && ultimoCodigo.length > 0) {
        const ultimoNumero = parseInt(ultimoCodigo[0].codigo.split('-')[1]) || 0
        codigo = `PROD-${String(ultimoNumero + 1).padStart(4, '0')}`
      } else {
        codigo = 'PROD-0001'
      }
    }

    const payload = {
      codigo: normalizarTexto(codigo),
      nome: normalizarTexto(data.nome),
      unidade_medida: data.unidade_medida || null,
      local_estoque: data.local_estoque || null,
      tipo: data.tipo || 'PRODUTO',
      finalidade: data.finalidade || 'AMBOS',
      foto_path: data.foto_path || null,
      qtd_minima_estoque: data.qtd_minima_estoque || 0,
      empresa_id: data.empresa_id || null,
      status: data.status || 'ATIVO',
    }

    const { data: inserted, error } = await supabase
      .from('adm_produtos')
      .insert(payload)
      .select('id, codigo')
      .single()

    if (error) {
      if (error.message?.includes('duplicate') || error.code === '23505') {
        return Response.json({ error: 'Já existe um produto com este código' }, { status: 400 })
      }
      throw error
    }

    return Response.json({ success: true, id: inserted.id, codigo: inserted.codigo })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return Response.json({ error: 'Erro ao criar produto: ' + error.message }, { status: 500 })
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
    if (data.unidade_medida !== undefined) payload.unidade_medida = data.unidade_medida
    if (data.local_estoque !== undefined) payload.local_estoque = data.local_estoque
    if (data.tipo) payload.tipo = data.tipo
    if (data.finalidade) payload.finalidade = data.finalidade
    if (data.foto_path !== undefined) payload.foto_path = data.foto_path
    if (data.qtd_minima_estoque !== undefined) payload.qtd_minima_estoque = data.qtd_minima_estoque
    if (data.status) payload.status = data.status

    const { error } = await supabase
      .from('adm_produtos')
      .update(payload)
      .eq('id', data.id)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return Response.json({ error: 'Erro ao atualizar produto: ' + error.message }, { status: 500 })
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
      .from('adm_produtos')
      .delete()
      .eq('id', id)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return Response.json({ error: 'Erro ao excluir produto: ' + error.message }, { status: 500 })
  }
}
