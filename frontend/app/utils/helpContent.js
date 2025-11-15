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
            <li>Configure taxas se aplicável</li>
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
          },
          {
            label: 'Vínculos',
            description: 'Vincule a tabela a clientes/fornecedores específicos. Clique no botão de vínculos para gerenciar quais parceiros usarão esta tabela.'
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
          'Múltiplas tabelas podem estar ativas ao mesmo tempo',
          'Vincule tabelas a parceiros específicos para aplicação automática de preços diferenciados'
        ]
      }
    ]
  },

  'ADM-002': {
    title: 'Funcionários',
    sections: [
      {
        heading: '📋 O que é esta tela?',
        icon: '📋',
        content: 'Cadastre e gerencie os funcionários da sua empresa, incluindo dados pessoais, informações trabalhistas e de acesso ao sistema.'
      },
      {
        heading: '🔑 Campos Principais',
        icon: '🔑',
        items: [
          {
            label: 'Nome Completo',
            description: 'Nome completo do funcionário conforme documentos.'
          },
          {
            label: 'CPF',
            description: 'Cadastro de Pessoa Física. O sistema valida automaticamente.'
          },
          {
            label: 'Cargo/Função',
            description: 'Cargo que o funcionário ocupa na empresa.'
          },
          {
            label: 'Data de Admissão',
            description: 'Data em que o funcionário foi contratado.'
          },
          {
            label: 'Salário',
            description: 'Salário base do funcionário (informação confidencial).'
          },
          {
            label: 'Status',
            description: 'Ativo (trabalhando) ou Inativo (desligado).'
          }
        ]
      },
      {
        tips: [
          'Mantenha os dados sempre atualizados',
          'Funcionários inativos são preservados para histórico',
          'Use filtros para encontrar rapidamente',
          'Configure permissões de acesso ao sistema se aplicável'
        ]
      }
    ]
  },

  'ADM-003': {
    title: 'Layouts de Importação',
    sections: [
      {
        heading: '📋 O que são Layouts de Importação?',
        icon: '📋',
        content: 'Configure como o sistema deve interpretar arquivos importados (CSV, TXT, Excel). Defina qual coluna contém cada informação.'
      },
      {
        heading: '🔑 Campos Principais',
        icon: '🔑',
        items: [
          {
            label: 'Nome do Layout',
            description: 'Nome descritivo para identificar o layout (ex: "Importação Produtos - Fornecedor A").'
          },
          {
            label: 'Tipo de Arquivo',
            description: 'CSV, TXT, Excel (XLS/XLSX) ou outro formato suportado.'
          },
          {
            label: 'Separador',
            description: 'Para CSV/TXT: vírgula, ponto-e-vírgula, tab, etc.'
          },
          {
            label: 'Mapeamento de Colunas',
            description: 'Defina qual coluna do arquivo corresponde a cada campo do sistema.'
          },
          {
            label: 'Linha Inicial',
            description: 'Número da linha onde começam os dados (pule cabeçalhos se necessário).'
          }
        ]
      },
      {
        tips: [
          'Teste o layout com um arquivo pequeno primeiro',
          'Salve layouts de fornecedores recorrentes',
          'Verifique o separador correto do arquivo',
          'Configure tratamento de erros (ignorar linha ou parar importação)'
        ]
      }
    ]
  },

  'ADM-004': {
    title: 'Configuração de Backup',
    sections: [
      {
        heading: '📋 O que é esta tela?',
        icon: '📋',
        content: 'Configure backups automáticos do banco de dados para proteger suas informações. Escolha entre backup local ou Google Drive.'
      },
      {
        heading: '🔑 Opções de Backup',
        icon: '🔑',
        items: [
          {
            label: 'Backup Local',
            description: 'Salva cópias em um diretório do servidor. Configure a pasta de destino e frequência.'
          },
          {
            label: 'Google Drive',
            description: 'Armazena backups na nuvem do Google Drive. Requer autenticação e configuração de pasta.'
          },
          {
            label: 'Frequência',
            description: 'Diária, Semanal ou Mensal. Define quando o backup automático será executado.'
          },
          {
            label: 'Retenção',
            description: 'Quantos backups manter. Backups mais antigos são excluídos automaticamente.'
          },
          {
            label: 'Horário',
            description: 'Hora em que o backup deve ser executado (recomendado: madrugada).'
          }
        ]
      },
      {
        heading: '⚠️ Importante',
        icon: '⚠️',
        content: 'Backups são essenciais para proteger seus dados. Configure ao menos um método de backup e teste a restauração periodicamente.'
      },
      {
        tips: [
          'Combine backup local E Google Drive para maior segurança',
          'Execute backups em horários de baixo uso do sistema',
          'Teste a restauração periodicamente',
          'Mantenha ao menos 7 backups diários e 4 semanais',
          'Verifique se há espaço suficiente no destino'
        ]
      }
    ]
  },

  'ADM-005': {
    title: 'Registro de Log',
    sections: [
      {
        heading: '📋 O que é o Registro de Log?',
        icon: '📋',
        content: 'Registro de todas as operações realizadas no sistema: quem fez, quando fez, em qual tela e qual ação. Essencial para auditoria e rastreamento de problemas.'
      },
      {
        heading: '🔍 Informações Registradas',
        icon: '🔍',
        items: [
          {
            label: 'Usuário',
            description: 'Quem realizou a operação (funcionário ou nome do usuário logado).'
          },
          {
            label: 'Data e Hora',
            description: 'Momento exato em que a ação foi executada.'
          },
          {
            label: 'Ação',
            description: 'Tipo de operação: Criação, Edição, Exclusão, Login, Logout, Exportação, Importação, etc.'
          },
          {
            label: 'Módulo/Tela',
            description: 'Qual parte do sistema foi acessada (ex: Cadastro de Clientes, Formas de Pagamento).'
          },
          {
            label: 'Detalhes',
            description: 'Informações específicas da ação, como ID do registro alterado, valores antigos e novos.'
          },
          {
            label: 'IP',
            description: 'Endereço IP de onde a ação foi realizada (útil para identificar acessos suspeitos).'
          }
        ]
      },
      {
        heading: '🔎 Filtros Disponíveis',
        icon: '🔎',
        items: [
          {
            label: 'Período',
            description: 'Filtre por data inicial e final para ver logs de um intervalo específico.'
          },
          {
            label: 'Usuário',
            description: 'Veja apenas ações de um funcionário específico.'
          },
          {
            label: 'Tipo de Ação',
            description: 'Filtre por tipo: apenas criações, apenas exclusões, etc.'
          },
          {
            label: 'Módulo',
            description: 'Veja logs de uma tela específica do sistema.'
          }
        ]
      },
      {
        heading: '📥 Exportação',
        icon: '📥',
        content: 'Exporte os logs para Excel ou CSV para análise externa, auditorias ou backup. O arquivo conterá todas as colunas e filtros aplicados.'
      },
      {
        heading: '⚠️ Importante',
        icon: '⚠️',
        content: 'Logs não podem ser editados ou excluídos para garantir integridade da auditoria. São mantidos por tempo indeterminado conforme legislação vigente.'
      },
      {
        tips: [
          'Use logs para identificar quem alterou informações importantes',
          'Exporte logs periodicamente para backup externo',
          'Monitore ações de exclusão e alterações em massa',
          'Verifique logs de login para identificar acessos suspeitos',
          'Use filtros para encontrar rapidamente a informação que precisa'
        ]
      }
    ]
  },

  'FIN-001': {
    title: 'Plano de Contas',
    sections: [
      {
        heading: '📋 O que é o Plano de Contas?',
        icon: '📋',
        content: 'Estrutura hierárquica que organiza todas as receitas e despesas da empresa. É a base para relatórios financeiros e DRE.'
      },
      {
        heading: '🔑 Campos Principais',
        icon: '🔑',
        items: [
          {
            label: 'Código da Conta',
            description: 'Código hierárquico (ex: 1, 1.1, 1.1.1). Quanto mais dígitos, mais específica a conta.'
          },
          {
            label: 'Descrição',
            description: 'Nome da conta (ex: "Receitas", "Vendas de Produtos", "Custos Operacionais").'
          },
          {
            label: 'Tipo',
            description: 'Receita (dinheiro que entra) ou Despesa (dinheiro que sai).'
          },
          {
            label: 'Aceita Lançamento',
            description: 'Contas de nível mais alto (sintéticas) não aceitam lançamento, apenas as folhas (analíticas).'
          },
          {
            label: 'Compõe DRE',
            description: 'Se esta conta deve aparecer no Demonstrativo de Resultados.'
          },
          {
            label: 'Tipo de Gasto',
            description: 'Para despesas: Fixo (todo mês) ou Variável (depende do uso/vendas).'
          }
        ]
      },
      {
        heading: '🌳 Estrutura Hierárquica',
        icon: '🌳',
        content: 'O plano de contas funciona como uma árvore. Contas de nível 1 (ex: "1") são gerais. Subcontas (ex: "1.1", "1.1.1") são cada vez mais específicas. Apenas as contas mais específicas (folhas) aceitam lançamentos.'
      },
      {
        tips: [
          'Não delete contas com movimentações, apenas desative',
          'Contas sintéticas (pai) somam automaticamente as contas filhas',
          'Use uma estrutura lógica e consistente',
          'Documente o que cada conta representa'
        ]
      }
    ]
  },

  'FIN-002': {
    title: 'Estrutura DRE',
    sections: [
      {
        heading: '📋 O que é a Estrutura DRE?',
        icon: '📋',
        content: 'DRE (Demonstrativo de Resultados do Exercício) mostra se a empresa teve lucro ou prejuízo. Nesta tela você cadastra a estrutura personalizada do seu DRE com linhas, cálculos e fórmulas.'
      },
      {
        heading: '⚙️ Como Funciona o Cadastro',
        icon: '⚙️',
        content: 'Você cria linhas sequenciais que formam seu DRE. Cada linha pode ser um título, uma conta do plano de contas, uma fórmula de cálculo ou um total. O sistema calcula automaticamente os valores baseado nas fórmulas que você definir.'
      },
      {
        heading: '🔑 Campos de Cadastro',
        icon: '🔑',
        items: [
          {
            label: 'Ordem',
            description: 'Número sequencial que define a posição da linha no DRE (1, 2, 3...). Controla a ordem de exibição.'
          },
          {
            label: 'Descrição',
            description: 'Texto que aparece no DRE (ex: "Receita Bruta", "(-) Impostos", "(=) Lucro Líquido").'
          },
          {
            label: 'Tipo',
            description: 'TÍTULO: apenas texto de seção | CONTA: vincula a uma conta do plano | FÓRMULA: calcula baseado em outras linhas | TOTAL: soma várias linhas.'
          },
          {
            label: 'Conta Vinculada',
            description: 'Se tipo = CONTA, selecione qual conta do plano de contas usar. O valor virá automaticamente dessa conta.'
          },
          {
            label: 'Fórmula',
            description: 'Se tipo = FÓRMULA, defina o cálculo usando referências a outras linhas (ex: L1 - L2 + L3).'
          },
          {
            label: 'Nível/Indentação',
            description: 'Número de 0 a 5 que define o recuo visual da linha. Use para criar hierarquia visual (0=sem recuo, 1=recuo pequeno, etc).'
          },
          {
            label: 'Negrito',
            description: 'Marque para destacar linhas importantes como totais e resultados finais.'
          },
          {
            label: 'Linha Divisória',
            description: 'Marque para adicionar linha horizontal de separação após esta linha.'
          }
        ]
      },
      {
        heading: '📝 Passo a Passo para Cadastrar',
        icon: '📝',
        content: <div>
          <ol className="list-decimal list-inside space-y-2">
            <li>Clique em "+ Nova Linha DRE"</li>
            <li>Defina a ordem (próximo número disponível)</li>
            <li>Digite a descrição que aparecerá no relatório</li>
            <li>Escolha o tipo (TÍTULO, CONTA, FÓRMULA ou TOTAL)</li>
            <li>Se tipo CONTA: selecione a conta do plano</li>
            <li>Se tipo FÓRMULA: defina a fórmula (ex: L1 - L2)</li>
            <li>Configure indentação para hierarquia visual</li>
            <li>Marque negrito e linha divisória se necessário</li>
            <li>Salve a linha</li>
          </ol>
        </div>
      },
      {
        heading: '💡 Exemplo de Fórmula',
        icon: '💡',
        content: 'Se linha 1 é Receita (R$ 10.000) e linha 2 é Custos (R$ 4.000), crie linha 3 com fórmula "L1 - L2" para calcular Lucro Bruto (R$ 6.000) automaticamente.'
      },
      {
        tips: [
          'Comece pelos títulos principais, depois adicione os detalhes',
          'Use referências de linha (L1, L2...) nas fórmulas, não valores fixos',
          'Teste sua estrutura com dados reais para validar cálculos',
          'Você pode ter múltiplas estruturas DRE para diferentes análises',
          'Use indentação para tornar o DRE mais legível',
          'Linhas de TOTAL geralmente ficam em negrito'
        ]
      }
    ]
  },

  'FIN-013': {
    title: 'Regras de Conciliação',
    sections: [
      {
        heading: '📋 O que são Regras de Conciliação?',
        icon: '📋',
        content: 'Automatize a classificação de transações bancárias. O sistema identifica padrões na descrição e classifica automaticamente.'
      },
      {
        heading: '🔑 Campos Principais',
        icon: '🔑',
        items: [
          {
            label: 'Nome da Regra',
            description: 'Descrição clara do que a regra identifica (ex: "Pagamentos de Cartão Visa").'
          },
          {
            label: 'Tipo de Operação',
            description: 'Crédito (entrada) ou Débito (saída). Define se é receita ou despesa.'
          },
          {
            label: 'Padrão de Busca',
            description: 'Palavra ou expressão que aparece na descrição da transação (ex: "PIX", "TED", "VISA").'
          },
          {
            label: 'Conta Contábil',
            description: 'Para qual conta do plano de contas a transação deve ser classificada.'
          },
          {
            label: 'Prioridade',
            description: 'Se múltiplas regras se aplicam, a de maior prioridade é usada.'
          }
        ]
      },
      {
        heading: '💡 Exemplos Práticos',
        icon: '💡',
        items: [
          {
            label: 'Pagamentos PIX',
            description: 'Padrão: "PIX" | Tipo: Débito | Conta: Despesas Diversas'
          },
          {
            label: 'Recebimento de Vendas',
            description: 'Padrão: "VENDA" ou "PGTO CLIENTE" | Tipo: Crédito | Conta: Receita de Vendas'
          },
          {
            label: 'Taxas Bancárias',
            description: 'Padrão: "TARIFA" ou "IOF" | Tipo: Débito | Conta: Despesas Bancárias'
          }
        ]
      },
      {
        tips: [
          'Comece com regras amplas e refine com o tempo',
          'Use prioridades para resolver conflitos entre regras',
          'Revise classificações automáticas periodicamente',
          'Mantenha as regras atualizadas conforme mudam os padrões do banco'
        ]
      }
    ]
  },

  'TAB-002': {
    title: 'Histórico de Alterações',
    sections: [
      {
        heading: '📋 O que é esta tela?',
        icon: '📋',
        content: 'Visualize todas as alterações feitas nas tabelas de preços: quem alterou, quando, valores antigos e novos.'
      },
      {
        heading: '🔍 Filtros Disponíveis',
        icon: '🔍',
        items: [
          {
            label: 'Tabela de Preços',
            description: 'Filtre por tabela específica para ver apenas suas alterações.'
          },
          {
            label: 'Tipo de Alteração',
            description: 'Criação, Edição ou Exclusão de tabelas.'
          },
          {
            label: 'Período',
            description: 'Data inicial e final para filtrar alterações em um período.'
          }
        ]
      },
      {
        heading: '📥 Exportação',
        icon: '📥',
        content: 'Exporte o histórico para CSV para análise externa ou auditoria. O arquivo incluirá todas as colunas visíveis na tela.'
      },
      {
        tips: [
          'Use para auditoria de alterações de preços',
          'Exporte periodicamente para backup',
          'Identifique quem fez alterações não autorizadas',
          'Análise tendências de mudanças de preços'
        ]
      }
    ]
  }
};
