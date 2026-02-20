import { Building2, Hammer, Home } from 'lucide-react'

export const PROJECT_CARDS = [
  {
    id: 'Flamboyant II',
    title: 'Flamboyant II',
    description: 'Torre Residencial - Fase de Acabamento',
    icon: Building2,
  },
  {
    id: 'Residencial Jardim Europa',
    title: 'Res. Jardim Europa',
    description: 'Condomínio Horizontal - Estrutura',
    icon: Home,
  },
  {
    id: 'Residencial Morada das Flores',
    title: 'Morada das Flores',
    description: 'Blocos 1 e 2 - Alvenaria',
    icon: Home,
  },
  {
    id: 'Condomínio Alto das Palmeiras',
    title: 'Alto das Palmeiras',
    description: 'Área de Lazer e Portaria',
    icon: Building2,
  },
  {
    id: 'Obra Interna — Reformas',
    title: 'Obra Interna',
    description: 'Reformas e Manutenção Geral',
    icon: Hammer,
  },
]

export const LOCATION_OPTIONS = {
  ladoA: [
    '101A',
    '102A',
    '103A',
    '104A',
    '105A',
    '106A',
    '107A',
    '108A',
    '109A',
    '110A',
    '111A',
    '112A',
    '201A',
    '202A',
    '203A',
    '204A',
    '205A',
    '206A',
    '207A',
    '208A',
    '209A',
    '210A',
    '211A',
    '212A',
  ],
  ladoB: ['102B', '110B', '210B'],
  areasComuns: ['Hall', 'Escada', 'Fachada'],
}

export const CHECKLIST_ESTRUTURAL = [
  {
    category: 'Alvenaria',
    description: 'Locação e assentamento dos blocos chaves e da 1ª fiada',
    acceptanceCriteria:
      'Dimensões conforme projeto e igual ao previsto pelo calculista',
    sampling: '100%',
    inspectionMethod: 'Uso de trena e projeto',
  },
  {
    category: 'Alvenaria',
    description: 'Locação das janelas e esquadrias de alumínio',
    acceptanceCriteria: 'Conforme projeto + 5,00 cm',
    sampling: '100%',
    inspectionMethod: 'Trena metálica',
  },
  {
    category: 'Alvenaria',
    description: 'Abertura dos vãos das portas de madeira',
    acceptanceCriteria: 'Conforme projeto + 8,00 cm',
    sampling: '100%',
    inspectionMethod: 'Trena metálica',
  },
  {
    category: 'Alvenaria',
    description: 'Juntas horizontais e verticais',
    acceptanceCriteria: 'Tolerância ±5 mm',
    sampling: '100%',
    inspectionMethod: 'Trena + conferência em projeto',
  },
  {
    category: 'Alvenaria',
    description: 'Prumo das paredes',
    acceptanceCriteria: 'Tolerância ±5 mm',
    sampling: '100%',
    inspectionMethod: 'Prumo de face',
  },
  {
    category: 'Alvenaria',
    description: 'Esquadro',
    acceptanceCriteria: 'Método 3:4:5 ou esquadro metálico ±10 mm',
    sampling: '100%',
    inspectionMethod: 'Trena metálica ou esquadro',
  },
  {
    category: 'Alvenaria',
    description: 'Encontros com estruturas de concreto',
    acceptanceCriteria:
      'Estrutura chapiscada e com a amarração conforme projeto',
    sampling: '100%',
    inspectionMethod: 'Inspeção visual',
  },
  {
    category: 'Alvenaria',
    description: 'Vãos de esquadrias',
    acceptanceCriteria: 'Projeto + 6 cm (tolerância ±2 cm)',
    sampling: '100%',
    inspectionMethod: 'Trena + projeto',
  },
  {
    category: 'Alvenaria',
    description: 'Altura de vergas e contravergas',
    acceptanceCriteria:
      'Conforme projeto e tolerância adequada ao vão da esquadria',
    sampling: '100%',
    inspectionMethod: 'Trena metálica',
  },
  {
    category: 'Alvenaria',
    description: 'Passagens de eletrodutos e tubulação',
    acceptanceCriteria: 'Conforme projeto executivo',
    sampling: '100%',
    inspectionMethod: 'Visual + conferência em projeto',
  },
  {
    category: 'Alvenaria',
    description: 'Aplicação do graute',
    acceptanceCriteria:
      'Após 24h, sem vazamentos e com preenchimento total das células',
    sampling: '100%',
    inspectionMethod: 'Furo de inspeção + visual',
  },
  {
    category: 'Alvenaria',
    description: 'Preservação do serviço concluído',
    acceptanceCriteria: 'Não causar danos a serviços já executados',
    sampling: '100%',
    inspectionMethod: 'Inspeção visual',
  },
]

export const CHECKLIST_NAO_ESTRUTURAL = [
  {
    category: 'Alvenaria',
    description: 'Abertura dos vãos das portas de madeira',
    acceptanceCriteria: 'Conforme projeto + 8,00 cm',
    sampling: '100%',
    inspectionMethod: 'Trena metálica',
  },
  {
    category: 'Alvenaria',
    description: 'Medida das bonecas',
    acceptanceCriteria: 'Conforme projeto',
    sampling: '100%',
    inspectionMethod: 'Trena metálica',
  },
  {
    category: 'Alvenaria',
    description: 'Prumo',
    acceptanceCriteria: 'Tolerância 10 mm',
    sampling: '100%',
    inspectionMethod: 'Prumo de face + trena',
  },
  {
    category: 'Alvenaria',
    description: 'Esquadro',
    acceptanceCriteria: 'Método 3:4:5 ou esquadro metálico ±10 mm',
    sampling: '100%',
    inspectionMethod: 'Trena ou esquadro',
  },
  {
    category: 'Alvenaria',
    description: 'Telas metálicas ou barras de aço (tijolo cerâmico)',
    acceptanceCriteria: 'Alternar a cada 3 fiadas',
    sampling: '100%',
    inspectionMethod: 'Inspeção visual',
  },
]
