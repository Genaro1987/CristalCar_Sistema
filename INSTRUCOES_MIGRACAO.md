# 🔧 Instruções de Migração do Banco de Dados

## ⚠️ IMPORTANTE - Leia Antes de Usar o Sistema

Se você está recebendo erros como:
- `SQLite error: table adm_empresa has no column named cpf_cnpj`
- `SQLite error: table fin_plano_contas has no column named considera_resultado`
- `Do not know how to serialize a BigInt`

**VOCÊ PRECISA EXECUTAR A MIGRAÇÃO DO BANCO!**

---

## 🚀 Como Executar a Migração

### Opção 1: Via Interface Web (Recomendado)

1. Acesse o sistema
2. Vá até: **Administrativo → Migrar Banco de Dados**
3. Clique em **"Verificar Estrutura"** para ver o estado atual
4. Clique em **"Executar Migrações"** para corrigir o banco
5. Aguarde a confirmação de sucesso

### Opção 2: Via API Diretamente

```bash
# Verificar estrutura atual
curl http://localhost:3000/api/database/migrate

# Executar migrações
curl -X POST http://localhost:3000/api/database/migrate
```

---

## 🔍 O Que a Migração Faz?

### 1. Adiciona Colunas Faltantes

#### Tabela: `adm_empresa`
- **Coluna**: `cpf_cnpj VARCHAR(18)`
- **Motivo**: Unificar documento de pessoa física e jurídica

#### Tabela: `fin_plano_contas`
- **Coluna**: `considera_resultado BOOLEAN DEFAULT 1`
- **Motivo**: Controlar se a conta compõe o DRE

### 2. Verifica Estrutura das Tabelas

A migração lista todas as colunas das seguintes tabelas:
- `adm_empresa`
- `fin_plano_contas`
- `fin_estrutura_dre`
- `fin_formas_pagamento`

---

## ✅ Problemas Resolvidos

### 1. Erro BigInt (RESOLVIDO NO CÓDIGO)
**Erro**: `Do not know how to serialize a BigInt`

**Causa**: SQLite retorna `lastInsertRowid` como BigInt, mas JSON não serializa BigInt

**Solução Aplicada**:
```javascript
// ANTES (errado)
return Response.json({ id: result.lastInsertRowid });

// DEPOIS (correto)
return Response.json({ id: Number(result.lastInsertRowid) });
```

**Status**: ✅ Corrigido em 6 APIs automaticamente

---

### 2. Erro de Coluna cpf_cnpj
**Erro**: `table adm_empresa has no column named cpf_cnpj`

**Causa**: Banco de dados desatualizado

**Solução**: Execute a migração para adicionar a coluna

---

### 3. Erro de Coluna considera_resultado
**Erro**: `table fin_plano_contas has no column named considera_resultado`

**Causa**: Banco de dados desatualizado

**Solução**: Execute a migração para adicionar a coluna

---

## 📋 Checklist Pós-Migração

Após executar a migração, teste:

- [ ] Cadastrar/Editar Empresa
- [ ] Cadastrar/Editar Funcionário
- [ ] Cadastrar/Editar Plano de Contas
- [ ] Cadastrar/Editar Estrutura DRE
- [ ] Cadastrar/Editar Forma de Pagamento
- [ ] Cadastrar/Editar Parceiro

**Todos devem funcionar SEM ERROS!**

---

## 🔄 Quando Executar a Migração?

### Sempre que:
1. Você clonar o repositório pela primeira vez
2. Atualizar o código e receber erros de "column not found"
3. O banco de dados for redefinido/recriado
4. Aparecer erro de BigInt (já está corrigido no código, mas por garantia)

### NÃO é necessário:
- A cada atualização de código que não muda o schema
- Se o sistema já está funcionando corretamente
- Se você já executou a migração uma vez e não teve erros

---

## ⚙️ Detalhes Técnicos

### Estrutura da API de Migração

#### GET /api/database/migrate
Retorna a estrutura atual das tabelas sem modificar nada.

**Resposta**:
```json
{
  "success": true,
  "tables": {
    "adm_empresa": [...colunas...],
    "fin_plano_contas": [...colunas...],
    ...
  }
}
```

#### POST /api/database/migrate
Executa as migrações necessárias.

**Resposta**:
```json
{
  "success": true,
  "message": "Migrações executadas",
  "migrations": [
    "✅ Coluna cpf_cnpj adicionada em adm_empresa",
    "✅ Coluna considera_resultado adicionada em fin_plano_contas"
  ],
  "tableStructures": {
    "adm_empresa": ["id", "razao_social", "cpf_cnpj", ...],
    "fin_plano_contas": ["id", "codigo_conta", "considera_resultado", ...]
  }
}
```

---

## 🛡️ Segurança

### A migração é segura?
✅ **SIM!** A migração apenas ADICIONA colunas, NUNCA:
- Remove dados
- Remove colunas
- Modifica dados existentes
- Deleta tabelas

### E se eu rodar a migração duas vezes?
✅ **Sem problema!** A migração detecta se a coluna já existe:
```
ℹ️ Coluna cpf_cnpj já existe em adm_empresa
```

---

## 🆘 Problemas?

### A migração falhou
1. Verifique as permissões do banco (TURSO_AUTH_TOKEN)
2. Verifique a conexão com o banco
3. Veja os logs no console do navegador (F12)
4. Entre em contato com suporte

### Ainda recebo erros após migração
1. Limpe o cache do navegador
2. Reinicie o servidor Next.js
3. Verifique se a migração foi realmente aplicada (use GET para verificar)

---

## 📊 Arquivos Relacionados

### APIs Corrigidas (BigInt → Number):
- `/frontend/app/api/administrativo/empresa/route.js`
- `/frontend/app/api/administrativo/funcionarios/route.js`
- `/frontend/app/api/plano-contas/route.js`
- `/frontend/app/api/estrutura-dre/route.js`
- `/frontend/app/api/financeiro/formas-pagamento/route.js`

### Ferramentas de Migração:
- `/frontend/app/api/database/migrate/route.js` - API de migração
- `/frontend/app/modules/administrativo/migrar-banco/page.js` - Interface web

### Schema de Referência:
- `/backend/src/schema.sql` - Schema completo do banco

---

## ✅ Conclusão

Execute a migração **UMA VEZ** e todos os erros de schema serão corrigidos!

**Caminho**: Administrativo → Migrar Banco de Dados → Executar Migrações

🎉 Pronto! O sistema deve funcionar perfeitamente agora!
