/**
 * Utilitários para normalização de texto
 * Converte para MAIÚSCULO e remove acentuação/caracteres especiais
 */

/**
 * Remove acentuação de uma string
 */
export function removerAcentos(texto) {
  if (!texto) return texto;

  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normaliza texto: MAIÚSCULO sem acentos
 */
export function normalizarTexto(texto) {
  if (!texto || typeof texto !== 'string') return texto;

  return removerAcentos(texto).toUpperCase();
}

/**
 * Normaliza texto removendo também caracteres especiais (exceto espaços e números)
 */
export function normalizarTextoSemEspeciais(texto) {
  if (!texto || typeof texto !== 'string') return texto;

  return removerAcentos(texto)
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ''); // Mantém apenas letras, números e espaços
}

/**
 * Normaliza um objeto de dados de parceiro
 * Aplica normalização apenas em campos de texto apropriados
 */
export function normalizarDadosParceiro(data) {
  const normalized = { ...data };

  // Campos que devem ser normalizados (MAIÚSCULO sem acentos)
  const camposTexto = [
    'razao_social',
    'nome_fantasia',
    'nome_completo',
    'endereco',
    'complemento',
    'bairro',
    'cidade',
    'estado',
    'banco',
    'observacoes',
    'tipo_parceiro',
    'tipo_pessoa',
    'tipo_conta'
  ];

  // Aplicar normalização
  camposTexto.forEach(campo => {
    if (normalized[campo]) {
      normalized[campo] = normalizarTexto(normalized[campo]);
    }
  });

  // Email sempre minúsculo sem espaços
  if (normalized.email) {
    normalized.email = normalized.email.toLowerCase().trim();
  }

  // Website sempre minúsculo sem espaços
  if (normalized.website) {
    normalized.website = normalized.website.toLowerCase().trim();
  }

  // Status sempre maiúsculo
  if (normalized.status) {
    normalized.status = normalized.status.toUpperCase();
  }

  // Remover espaços extras de todos os campos de texto
  Object.keys(normalized).forEach(key => {
    if (typeof normalized[key] === 'string') {
      normalized[key] = normalized[key].trim();
    }
  });

  return normalized;
}

/**
 * Valida se um texto contém apenas caracteres permitidos
 */
export function validarTextoPermitido(texto) {
  if (!texto) return true;

  // Permite apenas letras sem acento, números, espaços e pontuação básica
  const regex = /^[A-Z0-9\s.,\-/()]*$/;
  const textoNormalizado = normalizarTexto(texto);

  return regex.test(textoNormalizado);
}
