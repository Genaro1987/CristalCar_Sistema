# 🚀 Guia de Deploy - CristalCar Sistema

## Deploy no Vercel

Para fazer o deploy correto do projeto no Vercel, siga estas etapas:

### 1. Acesse o Painel do Vercel
- Vá para [https://vercel.com](https://vercel.com)
- Faça login com sua conta
- Selecione o projeto **CristalCar_Sistema**

### 2. Configure o Root Directory
No painel de configurações do projeto:

1. Vá em **Settings** (Configurações)
2. Na seção **General** → **Build & Development Settings**
3. Configure:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend` ⚠️ **IMPORTANTE!**
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)
   - **Install Command**: `npm install` (padrão)

### 3. Salve e Reimplante
- Clique em **Save** para salvar as configurações
- Vá em **Deployments** e clique em **Redeploy** no último deploy
- Ou faça um novo push para o GitHub para trigger automático

## ✅ Verificação

Após o deploy, o Vercel deve:
- ✅ Detectar Next.js automaticamente
- ✅ Executar `npm install` no diretório `frontend`
- ✅ Executar `npm run build` no diretório `frontend`
- ✅ Resolver os aliases `@/*` corretamente via `jsconfig.json`
- ✅ Gerar o build em `frontend/.next`

## 📁 Estrutura do Projeto

```
CristalCar_Sistema/
├── backend/              # API e scripts do banco de dados
│   ├── src/
│   └── package.json
├── frontend/            # ⚠️ ESTE É O ROOT DIRECTORY!
│   ├── app/
│   ├── jsconfig.json    # Configuração dos aliases @
│   ├── package.json
│   ├── next.config.mjs
│   └── tailwind.config.js
├── .github/
├── package.json         # Scripts da raiz (helper)
└── README.md
```

## 🔧 Troubleshooting

### Erro: "Module not found: Can't resolve '@/app/components/...'"
**Causa**: O Vercel não está usando o diretório `frontend` como raiz

**Solução**:
1. Verifique se o **Root Directory** está configurado como `frontend`
2. Reimplante o projeto após salvar

### Erro: "cd: frontend: No such file or directory"
**Causa**: O Vercel está tentando usar scripts da raiz ao invés de detectar o Next.js

**Solução**:
1. Certifique-se de que **Framework Preset** está como `Next.js`
2. Certifique-se de que **Root Directory** está como `frontend`
3. Remova qualquer `vercel.json` customizado da raiz
4. Reimplante

## 📞 Suporte

Se continuar com problemas:
1. Verifique os logs de build no painel do Vercel
2. Certifique-se de que o branch correto está selecionado
3. Tente fazer um novo deploy do zero (remover e re-importar o projeto)

---

**Última atualização**: 2024-11-15
