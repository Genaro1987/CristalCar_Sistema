// Mapeamento dinâmico de códigos de tela para nomes
// Os nomes são buscados da API adm_telas

let cachedScreenNames = null;

export async function getScreenName(code) {
  // Tentar buscar do cache primeiro
  if (cachedScreenNames && cachedScreenNames[code]) {
    return cachedScreenNames[code];
  }

  // Buscar da API
  try {
    const response = await fetch(`/api/administrativo/telas?codigo=${code}`);
    if (response.ok) {
      const tela = await response.json();
      if (tela && tela.nome) {
        if (!cachedScreenNames) cachedScreenNames = {};
        cachedScreenNames[code] = tela.nome;
        return tela.nome;
      }
    }
  } catch (error) {
    console.error('Erro ao buscar nome da tela:', error);
  }

  // Fallback para nomes hardcoded se API falhar
  const fallbackNames = {
    'HOME-001': 'PAGINA INICIAL',
    'ADM-001': 'CADASTRO DA EMPRESA',
    'ADM-002': 'FUNCIONARIOS',
    'ADM-006': 'DEPARTAMENTOS',
    'FIN-001': 'PLANO DE CONTAS',
    'FIN-002': 'TIPOS DE DRE',
    'FIN-003': 'ESTRUTURA DRE',
    'PAR-001': 'CADASTRO DE PARCEIROS',
    'OBJ-001': 'OBJETIVOS TRIMESTRAIS',
    'OBJ-002': 'METAS SEMANAIS',
    'IMP-001': 'IMPORTACAO DE EXTRATOS',
    'IMP-002': 'IMPORTACAO XML NF-E',
    'IND-001': 'INDICADORES CUSTOMIZAVEIS',
  };

  return fallbackNames[code] || 'TELA NAO CADASTRADA';
}

// Exportar cache para uso síncrono
export const screenNames = {
  'HOME-001': 'PAGINA INICIAL',
  'ADM-001': 'CADASTRO DA EMPRESA',
  'ADM-002': 'FUNCIONARIOS',
  'ADM-006': 'DEPARTAMENTOS',
  'FIN-001': 'PLANO DE CONTAS',
  'FIN-002': 'TIPOS DE DRE',
  'FIN-003': 'ESTRUTURA DRE',
  'PAR-001': 'CADASTRO DE PARCEIROS',
  'OBJ-001': 'OBJETIVOS TRIMESTRAIS',
  'OBJ-002': 'METAS SEMANAIS',
  'IMP-001': 'IMPORTACAO DE EXTRATOS',
  'IMP-002': 'IMPORTACAO XML NF-E',
  'IND-001': 'INDICADORES CUSTOMIZAVEIS',
};
