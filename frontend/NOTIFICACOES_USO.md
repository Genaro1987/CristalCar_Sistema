# Sistema de Notificações Customizado

## Instalação

### 1. Adicionar CSS de animação

Adicione ao seu `globals.css` ou `tailwind.config.js`:

```css
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
```

### 2. Envolver aplicação com Provider

No arquivo `app/layout.js`:

```javascript
import { NotificationProvider } from '../context/NotificationContext';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
```

## Uso Básico

```javascript
import { useNotification } from '@/hooks/useNotification';

function MeuComponente() {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  const handleSalvar = async () => {
    try {
      await api.salvar();
      showSuccess('Dados salvos com sucesso!');
    } catch (error) {
      showError('Erro ao salvar dados');
    }
  };

  return (
    <button onClick={handleSalvar}>
      Salvar
    </button>
  );
}
```

## API Completa

### Métodos Disponíveis

#### `showSuccess(message, title?)`
Exibe notificação de sucesso (verde)
- **message**: string - Mensagem a exibir
- **title**: string - Título (padrão: "Sucesso")
- **duration**: 5000ms

```javascript
showSuccess('Operação realizada com sucesso!');
showSuccess('Usuário criado', 'Novo Usuário');
```

#### `showError(message, title?)`
Exibe notificação de erro (vermelho)
- **message**: string - Mensagem a exibir
- **title**: string - Título (padrão: "Erro")
- **duration**: 7000ms

```javascript
showError('Não foi possível salvar os dados');
showError('Erro de conexão', 'Falha na Requisição');
```

#### `showWarning(message, title?)`
Exibe notificação de aviso (amarelo)
- **message**: string - Mensagem a exibir
- **title**: string - Título (padrão: "Atenção")
- **duration**: 6000ms

```javascript
showWarning('Você tem alterações não salvas');
showWarning('Sessão expirando em 5 minutos', 'Atenção');
```

#### `showInfo(message, title?)`
Exibe notificação informativa (azul)
- **message**: string - Mensagem a exibir
- **title**: string - Título (padrão: "Informação")
- **duration**: 5000ms

```javascript
showInfo('Sistema atualizado para versão 2.0');
showInfo('Backup agendado para 23:00', 'Lembrete');
```

#### `showNotification(options)`
Método genérico para notificações customizadas

**Options:**
- **type**: 'success' | 'error' | 'warning' | 'info'
- **title**: string (opcional)
- **message**: string (opcional)
- **duration**: number em ms (0 = não fecha automaticamente)

```javascript
showNotification({
  type: 'warning',
  title: 'Título Personalizado',
  message: 'Mensagem personalizada',
  duration: 10000 // 10 segundos
});
```

#### `hideNotification(id)`
Fecha uma notificação específica manualmente

```javascript
const id = showInfo('Processando...');
// Fazer algo...
hideNotification(id);
```

## Exemplos de Uso

### Exemplo 1: Formulário com Validação

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.nome) {
    showWarning('Por favor, preencha o nome');
    return;
  }

  try {
    await api.post('/parceiros', formData);
    showSuccess('Parceiro cadastrado com sucesso!');
    navigate('/parceiros');
  } catch (error) {
    showError(
      error.response?.data?.message || 'Erro ao cadastrar parceiro',
      'Falha no Cadastro'
    );
  }
};
```

### Exemplo 2: Operação Assíncrona

```javascript
const handleDelete = async (id) => {
  if (!confirm('Deseja realmente excluir?')) return;

  try {
    await api.delete(`/parceiros/${id}`);
    showSuccess('Parceiro excluído com sucesso');
    recarregarLista();
  } catch (error) {
    if (error.response?.status === 400) {
      showWarning('Parceiro possui vínculos e não pode ser excluído');
    } else {
      showError('Erro ao excluir parceiro');
    }
  }
};
```

### Exemplo 3: Notificação Persistente

```javascript
// Exibir notificação que não fecha automaticamente
const processarArquivo = async () => {
  const notificationId = showNotification({
    type: 'info',
    title: 'Processando',
    message: 'Importando arquivo...',
    duration: 0 // Não fecha automaticamente
  });

  try {
    await api.post('/importar', formData);
    hideNotification(notificationId);
    showSuccess('Arquivo importado com sucesso!');
  } catch (error) {
    hideNotification(notificationId);
    showError('Erro ao importar arquivo');
  }
};
```

### Exemplo 4: Múltiplas Notificações

```javascript
const handleBulkOperation = async (ids) => {
  let success = 0;
  let errors = 0;

  for (const id of ids) {
    try {
      await api.delete(`/item/${id}`);
      success++;
    } catch {
      errors++;
    }
  }

  if (success > 0) {
    showSuccess(`${success} itens excluídos com sucesso`);
  }

  if (errors > 0) {
    showError(`Erro ao excluir ${errors} itens`);
  }
};
```

## Personalização

### Alterar Cores

Edite o objeto `colors` em `Toast.js`:

```javascript
const colors = {
  success: 'bg-green-500 border-green-600',
  error: 'bg-red-500 border-red-600',
  warning: 'bg-yellow-500 border-yellow-600',
  info: 'bg-blue-500 border-blue-600',
};
```

### Alterar Ícones

Edite o objeto `icons` em `Toast.js`:

```javascript
const icons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};
```

### Alterar Posição

No `NotificationContext.js`, modifique a classe do container:

```javascript
// Canto superior direito (padrão)
<div className="fixed top-4 right-4 z-50 space-y-2">

// Canto superior esquerdo
<div className="fixed top-4 left-4 z-50 space-y-2">

// Centro superior
<div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2">

// Canto inferior direito
<div className="fixed bottom-4 right-4 z-50 space-y-2">
```

## Migração de alert() para Notificações

### Antes:
```javascript
alert('Dados salvos!');
```

### Depois:
```javascript
showSuccess('Dados salvos!');
```

### Antes:
```javascript
if (error) {
  alert('Erro: ' + error.message);
}
```

### Depois:
```javascript
if (error) {
  showError(error.message, 'Erro');
}
```

## Benefícios

- ✅ Estilo consistente com o design do sistema
- ✅ Não bloqueia a interface (não modal como alert/confirm)
- ✅ Múltiplas notificações simultâneas
- ✅ Fechamento automático configurável
- ✅ Animações suaves
- ✅ Responsivo e acessível
- ✅ Fácil de usar
- ✅ Totalmente customizável
