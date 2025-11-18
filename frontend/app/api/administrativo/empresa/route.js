import { createClient } from '@supabase/supabase-js'
import { normalizarTexto } from '@/lib/text-utils'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Configuração do Supabase ausente. Defina NEXT_PUBLIC_SUPABASE_URL e a chave (service ou anon).')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

// Normalizar dados de empresa
function normalizarDadosEmpresa(data) {
  const normalized = { ...data }

  const camposTexto = [
    'razao_social',
    'nome_fantasia',
    'endereco',
    'complemento',
    'bairro',
    'cidade',
    'estado',
    'regime_tributario',
    'observacoes'
  ]

  camposTexto.forEach(campo => {
    if (normalized[campo]) {
      normalized[campo] = normalizarTexto(normalized[campo])
    }
  })

  if (normalized.email) {
    normalized.email = normalized.email.toLowerCase().trim()
  }
  if (normalized.website || normalized.site) {
    normalized.website = (normalized.website || normalized.site).toLowerCase().trim()
  }

  Object.keys(normalized).forEach(key => {
    if (typeof normalized[key] === 'string') {
      normalized[key] = normalized[key].trim()
    }
  })

  return normalized
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const listarTodas = searchParams.get('all') === 'true'
    const empresaId = searchParams.get('id')

    const query = supabase
      .from('adm_empresa')
      .select('*')
      .order('padrao', { ascending: false })
      .order('id', { ascending: true })

    if (empresaId) {
      query.eq('id', Number(empresaId))
    }

    if (!listarTodas) {
      query.limit(1)
    }

    const { data, error } = await query
    if (error) throw error

    if (!data || data.length === 0) {
      return Response.json(null)
    }

    if (listarTodas) {
      const empresas = data.map(emp => ({
        ...emp,
        logo_path: emp.logo_path || emp.logo_url || null,
        site: emp.site || emp.website || null,
        padrao: !!emp.padrao,
      }))
      return Response.json(empresas)
    }

    const empresa = data[0]
    return Response.json({
      ...empresa,
      logo_path: empresa.logo_path || empresa.logo_url || null,
      site: empresa.site || empresa.website || null,
      padrao: !!empresa.padrao,
    })
  } catch (error) {
    console.error('Erro ao buscar empresa:', error)
    return Response.json({ error: 'Erro ao buscar dados da empresa' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const normalizedData = normalizarDadosEmpresa(data)
    normalizedData.id = normalizedData.id ? Number(normalizedData.id) : null
    normalizedData.padrao = normalizedData.padrao === true || normalizedData.padrao === 1 || normalizedData.padrao === '1'

    const payload = {
      razao_social: normalizedData.razao_social,
      nome_fantasia: normalizedData.nome_fantasia || null,
      cnpj: normalizedData.cnpj || normalizedData.cpf_cnpj || null,
      cpf_cnpj: normalizedData.cpf_cnpj || normalizedData.cnpj || null,
      inscricao_estadual: normalizedData.inscricao_estadual || null,
      inscricao_municipal: normalizedData.inscricao_municipal || null,
      regime_tributario: normalizedData.regime_tributario || 'SIMPLES_NACIONAL',
      telefone: normalizedData.telefone || null,
      celular: normalizedData.celular || null,
      email: normalizedData.email || null,
      website: normalizedData.website || normalizedData.site || null,
      site: normalizedData.site || normalizedData.website || null,
      endereco: normalizedData.endereco || null,
      numero: normalizedData.numero || null,
      complemento: normalizedData.complemento || null,
      bairro: normalizedData.bairro || null,
      cidade: normalizedData.cidade || null,
      estado: normalizedData.estado || null,
      cep: normalizedData.cep || null,
      logo_path: normalizedData.logo_path || normalizedData.logo_url || null,
      logo_url: normalizedData.logo_url || normalizedData.logo_path || null,
      observacoes: normalizedData.observacoes || null,
      padrao: normalizedData.padrao,
      atualizado_em: new Date().toISOString(),
    }

    if (normalizedData.id) {
      const { error } = await supabase
        .from('adm_empresa')
        .update(payload)
        .eq('id', normalizedData.id)

      if (error) throw error

      if (normalizedData.padrao) {
        const { error: cleanDefaultError } = await supabase
          .from('adm_empresa')
          .update({ padrao: false })
          .neq('id', normalizedData.id)
        if (cleanDefaultError) throw cleanDefaultError
      }

      return Response.json({ success: true, id: normalizedData.id, action: 'updated' })
    }

    const { data: inserted, error: insertError } = await supabase
      .from('adm_empresa')
      .insert({ ...payload, criado_em: new Date().toISOString() })
      .select('id')
      .single()

    if (insertError) throw insertError

    if (normalizedData.padrao && inserted?.id) {
      const { error: cleanDefaultError } = await supabase
        .from('adm_empresa')
        .update({ padrao: false })
        .neq('id', inserted.id)
      if (cleanDefaultError) throw cleanDefaultError
    }

    return Response.json({ success: true, id: inserted?.id, action: 'created' })
  } catch (error) {
    console.error('Erro ao salvar empresa:', error)
    return Response.json({ error: 'Erro ao salvar dados da empresa: ' + error.message }, { status: 500 })
  }
}
