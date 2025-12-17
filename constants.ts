
import { Product, RoutineSettings } from './types';

export const NIGHT_COLORS = {
  night_1: '#f4a460', // Arancione
  night_2: '#e084d9', // Rosa
  night_3_4: '#7db8a8' // Verde
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Hydro Boost Aqua Reinigungsgel',
    brand: 'Neutrogena',
    category: 'Detergente',
    usedIn: ['AM', 'PM'],
    description: 'Detergente in gel a base acquosa, delicato e non sgrassante. Contiene Glicerina per idratare. Essenziale per pulire senza danneggiare la barriera cutanea, fondamentale prima degli attivi PM.',
    usageAdvice: 'AM/PM: Massaggiare su pelle umida e risciacquare. Consiglio: Usarlo sotto la doccia o come primo passaggio ogni sera.',
    imageUrl: 'https://images.ctfassets.net/hcd109vfxzqs/38IZCGkJDgadGQj0WYeDa6/c9b4a1f0a9fe12f3d3bcbe0e487b5174/limpiadorgel_it-min-it-it?fm=webp&w=1024'
  },
  {
    id: '2',
    name: 'Anthelios UVMune 400 SPF 50+',
    brand: 'La Roche-Posay',
    category: 'SPF',
    usedIn: ['AM'],
    description: "Crema Idratante con protezione ad ampio spettro UVA/UVB, inclusa la difesa dai raggi UVA ultra-lunghi. L'SPF 50+ è il tuo principale strumento anti-età.",
    usageAdvice: 'AM (Finale): Applica generosamente (quantità pari a due dita) su viso e collo come ultimo passaggio della tua routine AM, 15 minuti prima di uscire. MAI saltare l\'SPF quando usi Retinal.',
    imageUrl: 'https://www.larocheposay.it/-/media/project/loreal/brand-sites/lrp/emea/it/products/anthelios/anthelios-uvmune-fluid-ap-50/new/lrpproductpagesunantheliosuvmune400fluidapspf503337875797580front.png?sc_lang=it-it'
  },
  {
    id: '3',
    name: 'Pro-Collagen Peptide Plumping Moisturizer',
    brand: "Paula's Choice",
    category: 'Crema',
    usedIn: ['PM'],
    cycleNights: [1, 2, 3, 4],
    description: 'Crema in Gel-Crema anti-età con Peptidi Pro-Collagene (3X Peptide Complex). Texture leggera ma ricca, ideale per idratare e rimpolpare. Non comedogena.',
    usageAdvice: 'PM (Finale): Usala come strato finale e sigillante in tutte e 4 le Notti del tuo ciclo per fornire nutrimento e supporto strutturale.',
    imageUrl: 'https://media.paulaschoice-eu.com/image/upload/f_auto,q_auto,dpr_auto/c_fill,w_300,h_300/products/images/1510-lifestyle?_i=AG' 
  },
  {
    id: '4',
    name: 'Liftactiv Collagen Specialist Crema',
    brand: 'Vichy',
    category: 'Crema',
    usedIn: ['AM'],
    description: 'Crema Giorno anti-età con Biopeptidi e Vitamina Cg (forma stabile di Vitamina C). Texture vellutata adatta a pelle mista.',
    usageAdvice: 'AM (Base): Ottima come crema base da usare sotto l\'SPF, subito dopo il siero Multi-Peptide.',
    imageUrl: 'https://www.vichy.it/-/media/project/loreal/brand-sites/vchy/emea/it/products/product-packshots---1/liftactiv/liftactiv-collagen-specialist-16-day-cream/vichy-cream-liftactiv-collagen-specialist-16-day-cream-3337875607254-packshot-front-top-reflection.png?rev=03f3d1fe1d13444bac7e33c3abe0c4e0&cx=0.48&cy=0.54&cw=525&ch=596&hash=C18F2A30FE349D8F0835EF9D4E6E3E2E'
  },
  {
    id: '5',
    name: 'Crema Antirid Hyaluron C',
    brand: 'Gerovital H3',
    category: 'Crema',
    usedIn: ['AM', 'PM'],
    description: 'Crema Giorno con Acido Ialuronico, Niacinamide e Vitamina C. Formula leggera, ottima opzione idratante ed antiossidante.',
    usageAdvice: 'AM/PM: Perfetta per alternare con la Vichy. La Niacinamide supporta la barriera e riduce i pori.',
    imageUrl: 'https://s13emagst.akamaized.net/products/35438/35437560/images/res_219c1cc71c9a062b522a28407089c66e.jpg'
  },
  {
    id: '6',
    name: 'Attiva Anti-Rughe Collagene',
    brand: "L'Oréal Paris",
    category: 'Crema',
    usedIn: ['AM', 'PM'],
    description: 'Crema idratante base con Collagene (probabilmente di origine vegetale) o Peptidi generici. Formula di comfort.',
    usageAdvice: 'Uso Extra: Puoi usarla per ritocchi durante il giorno a lavoro se la pelle tira, o come crema idratante base nelle sere di riposo, ma non sostituire i sieri attivi.',
    imageUrl: 'https://cdn.notinoimg.com/social/loreal-paris/3600520193700_01-o/loreal-paris-attiva-anti-rughe-collagene-crema-giorno-per-le-prime-rughe-35___240319.jpg'
  },
  {
    id: '7',
    name: '7% Ectoin Booster Siero',
    brand: "Paula's Choice",
    category: 'Trattamento',
    usedIn: ['PM'],
    cycleNights: [3, 4],
    description: 'Siero Lattiginoso concentrato con Ectoina (7%) e Acido Ialuronico. La Ectoina è un agente che ripara e fortifica la barriera cutanea e lenisce il rossore.',
    usageAdvice: 'PM (Notti 3 & 4): Mescola 2-3 gocce con il siero Multi-Peptide o con la crema PC Pro-Collagen per potenziare l\'azione riparatrice.',
    imageUrl: 'https://www.paulaschoice.com/dw/image/v2/BBNX_PRD/on/demandware.static/-/Sites-pc-catalog/default/dwbe2107d0/images/products/7-percent-ectoin-booster-1370-portrait.png?sw=520&sfrm=png' 
  },
  {
    id: '8',
    name: 'Porefectly Clear (2% BHA)',
    brand: 'Geek & Gorgeous',
    category: 'Esfoliante',
    usedIn: ['PM'],
    cycleNights: [1],
    isIrritant: true,
    description: 'Acido Salicilico 2% (BHA) in gel leggero. Agente liposolubile che dissolve il sebo nei pori. Controlla lucidità e punti neri.',
    usageAdvice: 'NOTTE 1 (Esfoliazione): 2-3 volte/settimana. Applicare sulla pelle completamente asciutta e lasciare assorbire per 5 minuti prima della crema finale.',
    imageUrl: 'https://geekandgorgeous.com/cdn/shop/files/Porefectly-Clear-web.jpg?v=1705586562&width=600'
  },
  {
    id: '9',
    name: 'Retinal 0.2% Emulsion Serum',
    brand: 'The Ordinary',
    category: 'Retinoide',
    usedIn: ['PM'],
    cycleNights: [2],
    isIrritant: true,
    description: 'Retinal (Retinaldeide) 0.2% in emulsione leggera. Retinoide ad alta potenza, efficace contro rughe e texture.',
    usageAdvice: 'NOTTE 2 (Rinnovo): 1-2 volte/settimana. Applicare una quantità pari a un chicco di riso su pelle completamente asciutta. Non mescolare con altri acidi.',
    imageUrl: 'https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dwa863ca2c/Images/products/The%20Ordinary/ord-retinal-02-emulsion-15ml.png?sw=800&sh=800&sm=fit'
  },
  {
    id: '10',
    name: 'Multi-Peptide + HA Serum',
    brand: 'The Ordinary',
    category: 'Siero',
    usedIn: ['AM', 'PM'],
    cycleNights: [3, 4],
    description: 'Siero a base acquosa. Contiene un complesso di peptidi avanzati (Matrixyl, Argirelox) e Acido Ialuronico per rimpolpare e sostenere il collagene.',
    usageAdvice: 'NOTTI 3 & 4 (Riparazione): Applicare 3-4 gocce come primo siero nelle notti di recupero. Si usa in combinazione con l\'Ectoin Booster.',
    imageUrl: 'https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dw68423659/Images/products/The%20Ordinary/rdn-multi-peptide-ha-serum-30ml.png?sw=800&sh=800&sm=fit'
  }
];

export const DEFAULT_ROUTINE_SETTINGS: RoutineSettings = {
  amRoutine: [
    { id: 'am_1', label: 'Detersione', productName: 'Hydro Boost Aqua Reinigungsgel' },
    { id: 'am_2', label: 'Siero', productName: 'Multi-Peptide + HA Serum' },
    { id: 'am_3', label: 'Crema', productName: 'Liftactiv Collagen Specialist Crema' },
    { id: 'am_4', label: 'SPF', productName: 'Anthelios UVMune 400 SPF 50+' }
  ],
  pmCycle: [
    {
      id: 'night_1',
      dayNumber: 1,
      title: 'Esfoliazione',
      description: 'Pulizia pori con BHA.',
      colorTheme: 'orange',
      isEnabled: true,
      steps: [
        { id: 'n1_1', label: 'Pulizia', productName: 'Hydro Boost Aqua Reinigungsgel' },
        { id: 'n1_2', label: 'Attivo', productName: 'Porefectly Clear (2% BHA)' },
        { id: 'n1_3', label: 'Crema', productName: 'Pro-Collagen Peptide Plumping Moisturizer' }
      ]
    },
    {
      id: 'night_2',
      dayNumber: 2,
      title: 'Retinoide',
      description: 'Rinnovo con Retinal.',
      colorTheme: 'pink',
      isEnabled: true,
      steps: [
        { id: 'n2_1', label: 'Pulizia', productName: 'Hydro Boost Aqua Reinigungsgel' },
        { id: 'n2_2', label: 'Attivo', productName: 'Retinal 0.2% Emulsion Serum' },
        { id: 'n2_3', label: 'Crema', productName: 'Pro-Collagen Peptide Plumping Moisturizer' }
      ]
    },
    {
      id: 'night_3',
      dayNumber: 3,
      title: 'Recupero',
      description: 'Peptidi e Barriera.',
      colorTheme: 'green',
      isEnabled: true,
      steps: [
        { id: 'n3_1', label: 'Pulizia', productName: 'Hydro Boost Aqua Reinigungsgel' },
        { id: 'n3_2', label: 'Siero', productName: 'Multi-Peptide + HA Serum' },
        { id: 'n3_3', label: 'Booster', productName: '7% Ectoin Booster Siero' },
        { id: 'n3_4', label: 'Crema', productName: 'Pro-Collagen Peptide Plumping Moisturizer' }
      ]
    },
    {
      id: 'night_4',
      dayNumber: 4,
      title: 'Recupero',
      description: 'Recupero completo.',
      colorTheme: 'green',
      isEnabled: true,
      steps: [
        { id: 'n4_1', label: 'Pulizia', productName: 'Hydro Boost Aqua Reinigungsgel' },
        { id: 'n4_2', label: 'Siero', productName: 'Multi-Peptide + HA Serum' },
        { id: 'n4_3', label: 'Booster', productName: '7% Ectoin Booster Siero' },
        { id: 'n4_4', label: 'Crema', productName: 'Pro-Collagen Peptide Plumping Moisturizer' }
      ]
    }
  ]
};
