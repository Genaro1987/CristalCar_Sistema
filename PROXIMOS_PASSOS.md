# Próximos Passos - Correções Pendentes

## ✅ Já Corrigido

1. ✅ **Cadastro de Empresa** - API implementada e funcionando
2. ✅ **Tabela adm_telas** - Criada com 23 telas do sistema

## 🔄 Pendente - Alta Prioridade

### 3. Sistema de Notificações Customizado

**Problema:** Avisos estão usando alert() do browser
**Solução:** Criar componente Toast/Notification

**Arquivos a criar:**
- `frontend/components/ui/Toast.js` - Componente de notificação
- `frontend/context/NotificationContext.js` - Context para gerenciar notificações
- `frontend/hooks/useNotification.js` - Hook para usar notificações

**Exemplo de uso:**
```javascript
const { showNotification } = useNotification();

showNotification({
  type: 'success', // success, error, warning, info
  title: 'Sucesso',
  message: 'Dados salvos com sucesso!',
  duration: 3000
});
```

### 4. Corrigir Favoritos

**Problemas:**
- Botão "Configurar" não funciona
- "Meus Favoritos" não carrega

**Solução:**
1. Atualizar API de favoritos para usar `adm_telas`
2. Criar modal de configuração de favoritos
3. Implementar drag-and-drop para ordenar

**Arquivos a modificar:**
- `frontend/app/api/favoritos/route.js` - Buscar de adm_telas
- `frontend/components/dashboard/FavoritesWidget.js` - Botão configurar
- Criar: `frontend/components/modals/ConfigurarFavoritosModal.js`

### 5. Backup em Pasta Local

**Problema:** Só tem opção de Google Drive
**Solução:** Adicionar backup para pasta local

**Implementação:**
- Backend: Gerar arquivo ZIP com dados
- Frontend: Download via browser
- Opção de backup automático agendado

**Arquivos a criar/modificar:**
- `backend/src/backup/create-backup.mjs`
- `frontend/app/api/backup/create/route.js`
- `frontend/app/modules/administrativo/backup/page.js`

---

## 📝 Estrutura de Dados

### adm_telas (já criada)
```sql
- codigo_tela (UNIQUE) - Ex: ADM_EMPRESA
- nome_tela - Ex: CADASTRO DE EMPRESA
- modulo - Ex: ADMINISTRATIVO
- caminho_tela - Ex: /modules/administrativo/empresa
- icone - Ex: Building
- ordem_exibicao
- exibir_favoritos (BOOLEAN)
- ativo (BOOLEAN)
```

### adm_favoritos (já existe)
```sql
- usuario_id (FK)
- codigo_tela (relaciona com adm_telas.codigo_tela)
- nome_tela
- caminho_tela
- ordem
```

---

## 🎯 Próxima Sessão

**Começar por:**
1. Sistema de Notificações (rápido e impacta UX)
2. Corrigir Favoritos (crítico para usabilidade)
3. Backup local (menos urgente)

**Ordem de implementação:**
```
1. Toast Component (30 min)
2. NotificationContext (15 min)
3. Substituir todos alert() (20 min)
4. API Favoritos (20 min)
5. Modal Configurar Favoritos (40 min)
6. Backup Local (60 min)
```

**Total estimado:** ~3 horas

---

## 🔗 Links Úteis

- Schema: `backend/src/schema.sql`
- APIs: `frontend/app/api/`
- Componentes: `frontend/components/`
- Utilitários: `frontend/lib/`

---

## 📊 Status Atual

| Item | Status | Prioridade |
|------|--------|------------|
| Cadastro Empresa | ✅ Feito | Alta |
| Tabela Telas | ✅ Feito | Alta |
| Notificações | 🔄 Pendente | Alta |
| Favoritos | 🔄 Pendente | Alta |
| Backup Local | 🔄 Pendente | Média |
