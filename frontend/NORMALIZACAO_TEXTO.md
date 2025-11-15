# Normalização de Texto - Frontend

## Objetivo

Todo texto inserido no sistema é automaticamente convertido para **MAIÚSCULO** e **sem acentuação ou caracteres especiais**, garantindo padronização e consistência dos dados.

## Implementação

### 1. Utilitários de Normalização (`lib/text-utils.js`)

Funções criadas:

#### `removerAcentos(texto)`
Remove acentuação usando normalização Unicode (NFD).

```javascript
// Exemplo:
removerAcentos("José") // retorna "Jose"
removerAcentos("São Paulo") // retorna "Sao Paulo"
```

#### `normalizarTexto(texto)`
Converte para MAIÚSCULO e remove acentos.

```javascript
// Exemplo:
normalizarTexto("João da Silva") // retorna "JOAO DA SILVA"
normalizarTexto("Rua José Bonifácio") // retorna "RUA JOSE BONIFACIO"
```

#### `normalizarTextoSemEspeciais(texto)`
Normaliza e remove caracteres especiais (mantém apenas letras, números e espaços).

```javascript
// Exemplo:
normalizarTextoSemEspeciais("José & Cia Ltda.") // retorna "JOSE  CIA LTDA"
```

#### `normalizarDadosParceiro(data)`
Normaliza um objeto completo de dados de parceiro.

**Campos normalizados (MAIÚSCULO sem acentos):**
- `razao_social`
- `nome_fantasia`
- `nome_completo`
- `endereco`
- `complemento`
- `bairro`
- `cidade`
- `estado`
- `banco`
- `observacoes`
- `tipo_parceiro`
- `tipo_pessoa`
- `tipo_conta`
- `status`

**Campos com tratamento especial:**
- `email` → sempre minúsculo
- `website` → sempre minúsculo
- Todos os campos → trim() para remover espaços extras

**Campos não alterados:**
- `telefone`, `celular` (apenas números)
- `cpf`, `cnpj` (apenas números)
- `cep` (números e hífen)
- Valores numéricos

### 2. Aplicação nas APIs

#### POST `/api/parceiros/cadastro`

```javascript
import { normalizarDadosParceiro } from '@/lib/text-utils';

export async function POST(request) {
  const data = await request.json();

  // Normalizar ANTES de inserir
  const normalizedData = normalizarDadosParceiro(data);

  // Inserir dados normalizados
  await turso.execute({ ... });
}
```

#### PUT `/api/parceiros/cadastro/[id]`

```javascript
export async function PUT(request, { params }) {
  const data = await request.json();

  // Normalizar ANTES de atualizar
  const normalizedData = normalizarDadosParceiro(data);

  // Atualizar com dados normalizados
  await turso.execute({ ... });
}
```

## Exemplos de Transformação

### Entrada → Saída

```javascript
// Nomes
"José Carlos" → "JOSE CARLOS"
"Maria Aparecida da Silva" → "MARIA APARECIDA DA SILVA"

// Razão Social
"Empresa Ltda." → "EMPRESA LTDA."
"José & Cia Comercial" → "JOSE & CIA COMERCIAL"

// Endereços
"Rua José Bonifácio" → "RUA JOSE BONIFACIO"
"Av. São João" → "AV. SAO JOAO"
"Complemento: apto 301" → "COMPLEMENTO: APTO 301"

// Cidades
"São Paulo" → "SAO PAULO"
"Ribeirão Preto" → "RIBEIRAO PRETO"

// Email (mantém minúsculo)
"CONTATO@EMPRESA.COM" → "contato@empresa.com"
"Jose.Silva@Email.com" → "jose.silva@email.com"

// Website (mantém minúsculo)
"WWW.EMPRESA.COM.BR" → "www.empresa.com.br"
```

## Caracteres Removidos

A normalização remove os seguintes caracteres especiais:

- **Acentos agudos:** á, é, í, ó, ú → a, e, i, o, u
- **Acentos graves:** à, è, ì, ò, ù → a, e, i, o, u
- **Acentos circunflexos:** â, ê, î, ô, û → a, e, i, o, u
- **Til:** ã, õ → a, o
- **Cedilha:** ç → c
- **Trema:** ü → u

## Caracteres Mantidos

- **Letras:** A-Z (após conversão para maiúsculo)
- **Números:** 0-9
- **Espaços:** mantidos
- **Pontuação básica:** . , - / ( ) mantidos na versão padrão
- **Email/Website:** mantém todos caracteres válidos (@ . -)

## Benefícios

1. ✅ **Padronização**: Todos os dados no mesmo formato
2. ✅ **Consistência**: Facilita buscas e comparações
3. ✅ **Compatibilidade**: Evita problemas com encoding
4. ✅ **Profissionalismo**: Visual mais formal e corporativo
5. ✅ **Performance**: Queries mais eficientes sem case-sensitivity

## Uso em Outros Módulos

Para aplicar normalização em outros módulos do sistema:

```javascript
import { normalizarTexto, normalizarDadosParceiro } from '@/lib/text-utils';

// Para um campo específico
const nomeNormalizado = normalizarTexto(nome);

// Para um objeto completo (adaptar conforme necessário)
const dadosNormalizados = normalizarDadosParceiro(dados);
```

## Validação (Futura)

A função `validarTextoPermitido()` está disponível para validação:

```javascript
import { validarTextoPermitido } from '@/lib/text-utils';

if (!validarTextoPermitido(texto)) {
  // Texto contém caracteres não permitidos
}
```

## Observações Importantes

1. A normalização é feita **automaticamente** nas APIs
2. O frontend pode exibir em qualquer formato, mas o banco sempre recebe normalizado
3. Email e website são **exceções** e mantêm-se em minúsculo
4. Números, telefones e documentos **não são alterados**
5. Espaços extras são automaticamente removidos (trim)

## Arquivos Modificados

- ✅ `frontend/lib/text-utils.js` (NOVO)
- ✅ `frontend/app/api/parceiros/cadastro/route.js`
- ✅ `frontend/app/api/parceiros/cadastro/[id]/route.js`

## Próximos Passos (Opcional)

1. Aplicar normalização em outros módulos (clientes, fornecedores, etc.)
2. Adicionar validação client-side nos formulários
3. Criar componente React que normalize em tempo real durante digitação
4. Adicionar indicador visual mostrando texto normalizado
