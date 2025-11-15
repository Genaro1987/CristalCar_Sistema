// Conteúdos de ajuda para cada tela do sistema

export const helpContents = {
  'ADM-001': {
    title: 'Cadastro da Empresa',
    sections: [
      {
        heading: '📋 O que é esta tela?',
        icon: '📋',
        content: 'Nesta tela você cadastra as informações da sua empresa que serão utilizadas em todo o sistema, incluindo documentos fiscais, relatórios e integrações.'
      },
      {
        heading: '🔑 Campos Principais',
        icon: '🔑',
        items: [
          {
            label: 'Razão Social',
            description: 'Nome oficial da empresa conforme registrado na Receita Federal. Este nome aparecerá em documentos fiscais.'
          },
          {
            label: 'Nome Fantasia',
            description: 'Nome comercial da empresa, utilizado no dia a dia e em relatórios internos.'
          },
          {
            label: 'CNPJ',
            description: 'Cadastro Nacional de Pessoa Jurídica. Deve ser válido e corresponder ao registrado na Receita Federal.'
          },
          {
            label: 'Regime Tributário',
            description: 'Define como sua empresa é tributada. Influencia em cálculos de impostos: Simples Nacional, Lucro Presumido ou Lucro Real.'
          },
          {
            label: 'Logo da Empresa',
            description: 'Imagem que aparecerá em documentos e relatórios. Formatos aceitos: PNG, JPG, SVG (máx. 2MB).'
          }
        ]
      },
      {
        heading: '⚙️ Como usar',
        icon: '⚙️',
        content: <div>
          <ol className="list-decimal list-inside space-y-2">
            <li>Preencha todos os campos obrigatórios (marcados com *)</li>
            <li>Faça upload da logo da empresa se desejar</li>
            <li>Verifique se todos os dados estão corretos</li>
            <li>Clique em "Salvar Dados" para gravar as informações</li>
          </ol>
        </div>
      },
      {
        tips: [
          'Mantenha os dados sempre atualizados, especialmente endereço e telefone',
          'A logo será redimensionada automaticamente para caber em documentos',
          'O regime tributário afeta o cálculo de impostos em todo o sistema',
          'As informações podem ser editadas a qualquer momento'
        ]
      }
    ]
  },

  'FIN-010': {
    title: 'Formas de Pagamento',
    sections: [
      {
        heading: '📋 O que são Formas de Pagamento?',
        icon: '📋',
        content: 'Formas de pagamento definem os meios pelos quais sua empresa recebe ou efetua pagamentos. Cada forma pode ter taxas e prazos específicos.'
      },
      {
        heading: '🔑 Campos Principais',
        icon: '🔑',
        items: [
          {
            label: 'Código',
            description: 'Identificador único da forma de pagamento (ex: FP001, FP002). Use um padrão consistente.'
          },
          {
            label: 'Descrição',
            description: 'Nome descritivo da forma de pagamento (ex: "Dinheiro", "PIX", "Cartão de Crédito Visa").'
          },
          {
            label: 'Tipo',
            description: 'Categoria da forma de pagamento: Dinheiro, PIX, Cartão (Crédito/Débito), Boleto, Transferência, Cheque ou Outros.'
          },
          {
            label: 'Taxa Percentual',
            description: 'Percentual cobrado sobre o valor da transação (ex: 3.5% para cartão de crédito).'
          },
          {
            label: 'Taxa Fixa',
            description: 'Valor fixo cobrado por transação (ex: R$ 2,50 por boleto).'
          },
          {
            label: 'Dias para Recebimento',
            description: 'Prazo médio em dias para o valor estar disponível (ex: 30 dias para cartão de crédito).'
          },
          {
            label: 'Gera Movimento Bancário',
            description: 'Marque se esta forma de pagamento deve aparecer na conciliação bancária.'
          }
        ]
      },
      {
        heading: '⚙️ Como usar',
        icon: '⚙️',
        content: <div>
          <ol className="list-decimal list-inside space-y-2">
            <li>Clique em "+ Nova Forma de Pagamento"</li>
            <li>Preencha o código e descrição</li>
            <li>Selecione o tipo de pagamento</li>
            <li>Configure taxas e prazos se aplicável</li>
            <li>Marque se gera movimento bancário</li>
            <li>Salve a forma de pagamento</li>
          </ol>
        </div>
      },
      {
        heading: '💰 Exemplo de Cálculo',
        icon: '💰',
        content: 'O sistema mostra um exemplo automático: para uma transação de R$ 1.000,00, você verá quanto será o valor líquido após descontar as taxas configuradas.'
      },
      {
        tips: [
          'Configure todas as formas de pagamento que sua empresa aceita',
          'Mantenha as taxas atualizadas conforme negociação com operadoras',
          'Use códigos padronizados para facilitar identificação',
          'Formas de pagamento podem ser desativadas sem excluir o histórico'
        ]
      }
    ]
  },

  'FIN-011': {
    title: 'Condições de Pagamento',
    sections: [
      {
        heading: '📋 O que são Condições de Pagamento?',
        icon: '📋',
        content: 'Condições de pagamento definem como o valor total será pago: à vista, parcelado, com desconto, etc. Vinculam-se às formas de pagamento.'
      },
      {
        heading: '🔑 Campos Principais',
        icon: '🔑',
        items: [
          {
            label: 'Nome da Condição',
            description: 'Descrição clara da condição (ex: "À vista com 5% desconto", "3x sem juros").'
          },
          {
            label: 'Tipo',
            description: 'À Vista (pagamento único imediato), A Prazo (pagamento único futuro), ou Parcelado (múltiplas parcelas).'
          },
          {
            label: 'Forma de Pagamento',
            description: 'Qual forma de pagamento será usada (Dinheiro, PIX, Cartão, etc).'
          },
          {
            label: 'Quantidade de Parcelas',
            description: 'Para pagamentos parcelados, define em quantas vezes será dividido.'
          },
          {
            label: 'Dias até Primeira Parcela',
            description: 'Prazo em dias até vencimento da primeira parcela (0 = hoje).'
          },
          {
            label: 'Dias Entre Parcelas',
            description: 'Intervalo em dias entre cada parcela (padrão: 30 dias).'
          },
          {
            label: 'Desconto/Acréscimo',
            description: 'Percentual de desconto (para incentivar) ou acréscimo (juros) sobre o valor total.'
          }
        ]
      },
      {
        heading: '📊 Preview de Parcelas',
        icon: '📊',
        content: 'Ao configurar uma condição, o sistema mostra automaticamente como ficará o parcelamento em um exemplo de R$ 1.000,00, incluindo datas de vencimento e valores.'
      },
      {
        heading: '💡 Exemplos Práticos',
        icon: '💡',
        items: [
          {
            label: 'À vista com desconto',
            description: 'Tipo: À Vista | Desconto: 5% | Dias: 0 | Resultado: Cliente paga menos para incentivar pagamento imediato'
          },
          {
            label: '3x sem juros',
            description: 'Tipo: Parcelado | Parcelas: 3 | Dias entre: 30 | Resultado: Valor dividido em 3 parcelas mensais'
          },
          {
            label: '30/60/90 dias',
            description: 'Tipo: Parcelado | Parcelas: 3 | Primeira: 30 | Entre: 30 | Resultado: Parcelas em 30, 60 e 90 dias'
          }
        ]
      },
      {
        tips: [
          'Crie condições atrativas para incentivar formas de pagamento que você prefere',
          'Use descontos para pagamento à vista se precisar de fluxo de caixa rápido',
          'Configure todas as opções que oferece aos clientes',
          'As condições podem ser desativadas sem perder o histórico de vendas'
        ]
      }
    ]
  },

  'FIN-012': {
    title: 'Cadastro de Bancos',
    sections: [
      {
        heading: '📋 O que é esta tela?',
        icon: '📋',
        content: 'Cadastre suas contas bancárias e configure a importação automática de extratos OFX para facilitar a conciliação bancária.'
      },
      {
        heading: '🔑 Campos Principais',
        icon: '🔑',
        items: [
          {
            label: 'Código do Banco',
            description: 'Código de 3 dígitos do banco (ex: 001 para Banco do Brasil, 341 para Itaú, 041 para Banrisul).'
          },
          {
            label: 'Nome/Nome Completo',
            description: 'Nome curto e nome completo do banco para identificação.'
          },
          {
            label: 'Agência e Conta',
            description: 'Dados da sua conta bancária para referência e conciliação.'
          },
          {
            label: 'Tipo de Conta',
            description: 'Corrente, Poupança, Investimento ou Aplicação.'
          },
          {
            label: 'Permite OFX',
            description: 'Marque se deseja importar extratos OFX automaticamente deste banco.'
          }
        ]
      },
      {
        heading: '⚙️ Configuração OFX',
        icon: '⚙️',
        content: 'OFX (Open Financial Exchange) permite importar automaticamente transações do seu banco. Configure os campos que o seu banco usa no arquivo OFX para que o sistema identifique corretamente data, valor, descrição, etc.'
      },
      {
        heading: '🏦 Templates Pré-configurados',
        icon: '🏦',
        content: 'O sistema inclui configurações prontas para bancos populares como Banrisul, Bradesco, Itaú, etc. Basta selecionar o template e ajustar se necessário.'
      },
      {
        tips: [
          'Configure apenas os bancos que sua empresa realmente usa',
          'A importação OFX economiza muito tempo na conciliação bancária',
          'Verifique com seu banco como exportar arquivos OFX',
          'Os templates podem ser personalizados se o padrão do banco mudar'
        ]
      }
    ]
  },

  'PAR-001': {
    title: 'Cadastro de Parceiros',
    sections: [
      {
        heading: '📋 O que são Parceiros?',
        icon: '📋',
        content: 'Parceiros são todas as pessoas e empresas com as quais você se relaciona comercialmente: clientes, fornecedores, transportadoras, prestadores de serviço, etc.'
      },
      {
        heading: '🔑 Campos Principais',
        icon: '🔑',
        items: [
          {
            label: 'Tipo de Parceiro',
            description: 'Cliente (quem compra de você), Fornecedor (de quem você compra), Transportadora, Prestador de Serviço, Funcionário ou Outro.'
          },
          {
            label: 'Tipo de Pessoa',
            description: 'Pessoa Física (CPF) ou Pessoa Jurídica (CNPJ).'
          },
          {
            label: 'Nome/Razão Social',
            description: 'Nome completo ou razão social do parceiro.'
          },
          {
            label: 'CPF/CNPJ',
            description: 'Documento de identificação. O sistema valida automaticamente.'
          },
          {
            label: 'Contatos',
            description: 'Telefone, celular, email e website para comunicação.'
          },
          {
            label: 'Endereço Completo',
            description: 'Endereço para correspondência, entregas e documentos fiscais.'
          },
          {
            label: 'Informações Comerciais',
            description: 'Limite de crédito, tabela de preços, condição de pagamento padrão.'
          }
        ]
      },
      {
        heading: '⚙️ Como usar',
        icon: '⚙️',
        content: <div>
          <ol className="list-decimal list-inside space-y-2">
            <li>Clique em "+ Novo Parceiro"</li>
            <li>Selecione o tipo (Cliente, Fornecedor, etc)</li>
            <li>Escolha Pessoa Física ou Jurídica</li>
            <li>Preencha os dados cadastrais</li>
            <li>Configure informações comerciais se aplicável</li>
            <li>Salve o cadastro</li>
          </ol>
        </div>
      },
      {
        heading: '🔍 Pesquisa e Filtros',
        icon: '🔍',
        content: 'Use a barra de pesquisa para encontrar parceiros por nome, CPF/CNPJ, email ou telefone. Filtre por tipo para ver apenas clientes, apenas fornecedores, etc.'
      },
      {
        tips: [
          'Mantenha os dados de contato sempre atualizados',
          'Use o limite de crédito para controlar inadimplência',
          'Um parceiro pode ter múltiplos tipos (ser cliente E fornecedor)',
          'Configure a tabela de preços e condição de pagamento padrão para agilizar vendas'
        ]
      }
    ]
  },

  'TAB-001': {
    title: 'Tabelas de Preços',
    sections: [
      {
        heading: '📋 O que são Tabelas de Preços?',
        icon: '📋',
        content: 'Tabelas de preços permitem ter diferentes preços para os mesmos produtos/serviços baseados em critérios como tipo de cliente, volume, período promocional, etc.'
      },
      {
        heading: '🔑 Tipos de Ajuste',
        icon: '🔑',
        items: [
          {
            label: 'Percentual (%)',
            description: 'Aumenta ou reduz o preço base por um percentual (ex: +10% para tabela atacado, -5% para promoção).'
          },
          {
            label: 'Valor Fixo (R$)',
            description: 'Adiciona ou subtrai um valor fixo (ex: +R$ 50,00 ou -R$ 10,00).'
          },
          {
            label: 'Substituir Preço',
            description: 'Define um preço específico que substitui completamente o preço base.'
          }
        ]
      },
      {
        heading: '⚙️ Configurações',
        icon: '⚙️',
        items: [
          {
            label: 'Vigência',
            description: 'Defina período de início e fim para tabelas promocionais. Deixe em branco para tabelas permanentes.'
          },
          {
            label: 'Status',
            description: 'Tabelas ativas aparecem nas vendas. Desative temporariamente sem excluir.'
          }
        ]
      },
      {
        heading: '💡 Exemplos Práticos',
        icon: '💡',
        items: [
          {
            label: 'Tabela Atacado',
            description: 'Tipo: Percentual -15% | Para clientes que compram em grande volume'
          },
          {
            label: 'Black Friday',
            description: 'Tipo: Percentual -30% | Vigência: 24/11 a 27/11 | Promoção temporária'
          },
          {
            label: 'Parceiros Premium',
            description: 'Tipo: Percentual -20% | Para clientes especiais com desconto permanente'
          }
        ]
      },
      {
        tips: [
          'Use nomes descritivos para identificar facilmente',
          'Configure períodos de vigência para promoções temporárias',
          'O preview mostra o impacto do ajuste em tempo real',
          'Múltiplas tabelas podem estar ativas ao mesmo tempo'
        ]
      }
    ]
  }
};
