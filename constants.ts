import { Product, RoutineSettings } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Hydro Boost Aqua Gel',
    brand: 'Neutrogena',
    category: 'Detergente',
    usedIn: ['AM', 'PM'],
    notes: 'Delicato per mattina e sera',
    imageUrl: 'https://images.ctfassets.net/hcd109vfxzqs/38IZCGkJDgadGQj0WYeDa6/c9b4a1f0a9fe12f3d3bcbe0e487b5174/limpiadorgel_it-min-it-it?fm=webp&w=1024'
  },
  {
    id: '2',
    name: 'Multi-Peptide + HA Serum',
    brand: 'The Ordinary',
    category: 'Siero',
    usedIn: ['AM', 'PM'],
    cycleNights: [3, 4],
    notes: 'Ottimo per il recupero',
    imageUrl: 'https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dw68423659/Images/products/The%20Ordinary/rdn-multi-peptide-ha-serum-30ml.png?sw=800&sh=800&sm=fit'
  },
  {
    id: '3',
    name: 'Liftactiv Collagen Specialist',
    brand: 'Vichy',
    category: 'Crema',
    usedIn: ['AM'],
    imageUrl: 'https://www.vichy.it/-/media/project/loreal/brand-sites/vchy/emea/it/products/product-packshots---1/liftactiv/liftactiv-collagen-specialist-16-day-cream/vichy-cream-liftactiv-collagen-specialist-16-day-cream-3337875607254-packshot-front-top-reflection.png?rev=03f3d1fe1d13444bac7e33c3abe0c4e0&cx=0.48&cy=0.54&cw=525&ch=596&hash=C18F2A30FE349D8F0835EF9D4E6E3E2E'
  },
  {
    id: '4',
    name: 'Anthelios UVMUNE 400 SPF 50+',
    brand: 'La Roche-Posay',
    category: 'SPF',
    usedIn: ['AM'],
    notes: 'Indispensabile ogni mattina',
    imageUrl: 'https://www.larocheposay.it/-/media/project/loreal/brand-sites/lrp/emea/it/products/anthelios/anthelios-uvmune-fluid-ap-50/new/lrpproductpagesunantheliosuvmune400fluidapspf503337875797580front.png?sc_lang=it-it'
  },
  {
    id: '5',
    name: 'Porefectly Clear (2% BHA)',
    brand: 'Geek & Gorgeous',
    category: 'Esfoliante',
    usedIn: ['PM'],
    cycleNights: [1],
    isIrritant: true,
    notes: 'Solo notte 1. Attenzione agli occhi.',
    imageUrl: 'https://geekandgorgeous.com/cdn/shop/files/Porefectly-Clear-web.jpg?v=1705586562&width=600'
  },
  {
    id: '6',
    name: 'Retinal 0.2% Emulsion',
    brand: 'The Ordinary',
    category: 'Retinoide',
    usedIn: ['PM'],
    cycleNights: [2],
    isIrritant: true,
    notes: 'Solo notte 2. Applicare su pelle asciutta.',
    imageUrl: 'https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dwa863ca2c/Images/products/The%20Ordinary/ord-retinal-02-emulsion-15ml.png?sw=800&sh=800&sm=fit'
  },
  {
    id: '7',
    name: 'Ectoin 7% Booster',
    brand: 'Paula\'s Choice',
    category: 'Trattamento',
    usedIn: ['PM'],
    cycleNights: [3, 4],
    notes: 'Calmante e riparatore',
    imageUrl: 'https://www.my-personaltrainer.it/2025/10/30/uriage-orig.jpeg'
  },
  {
    id: '8',
    name: 'Crema Antirid Hyaluron C',
    brand: 'Gerovital',
    category: 'Crema',
    usedIn: ['PM'],
    notes: 'Sigillare la routine serale',
    imageUrl: 'https://www.vichy.it/-/media/project/loreal/brand-sites/vchy/emea/it/products/product-packshots---1/liftactiv/liftactiv-collagen-specialist-16-day-cream/vichy-cream-liftactiv-collagen-specialist-16-day-cream-3337875607254-packshot-front-top-reflection.png?rev=03f3d1fe1d13444bac7e33c3abe0c4e0&cx=0.48&cy=0.54&cw=525&ch=596&hash=C18F2A30FE349D8F0835EF9D4E6E3E2E'
  }
];

export const DEFAULT_ROUTINE_SETTINGS: RoutineSettings = {
  amRoutine: [
    { id: 'am_1', label: 'Detersione', productName: 'Hydro Boost Aqua Gel' },
    { id: 'am_2', label: 'Siero', productName: 'Multi-Peptide + HA Serum' },
    { id: 'am_3', label: 'Crema', productName: 'Liftactiv Collagen Specialist' },
    { id: 'am_4', label: 'SPF', productName: 'Anthelios UVMUNE 400 SPF 50+' }
  ],
  pmCycle: [
    {
      id: 'night_1',
      dayNumber: 1,
      title: 'Esfoliazione',
      description: 'Rimuove le cellule morte e libera i pori.',
      colorTheme: 'orange',
      isEnabled: true,
      steps: [
        { id: 'n1_1', label: 'Pulizia', productName: 'Hydro Boost Aqua Gel' },
        { id: 'n1_2', label: 'Attivo', productName: 'Porefectly Clear (2% BHA)' },
        { id: 'n1_3', label: 'Crema', productName: 'Crema Antirid Hyaluron C' }
      ]
    },
    {
      id: 'night_2',
      dayNumber: 2,
      title: 'Retinoide',
      description: 'Stimola il turn-over cellulare e il collagene.',
      colorTheme: 'pink',
      isEnabled: true,
      steps: [
        { id: 'n2_1', label: 'Pulizia', productName: 'Hydro Boost Aqua Gel' },
        { id: 'n2_2', label: 'Attivo', productName: 'Retinal 0.2% Emulsion' },
        { id: 'n2_3', label: 'Crema', productName: 'Crema Antirid Hyaluron C' }
      ]
    },
    {
      id: 'night_3',
      dayNumber: 3,
      title: 'Recupero',
      description: 'Idratazione profonda e riparazione barriera.',
      colorTheme: 'green',
      isEnabled: true,
      steps: [
        { id: 'n3_1', label: 'Pulizia', productName: 'Hydro Boost Aqua Gel' },
        { id: 'n3_2', label: 'Trattamento', productName: 'Multi-Peptide + HA Serum' },
        { id: 'n3_3', label: 'Trattamento', productName: 'Ectoin 7% Booster' },
        { id: 'n3_4', label: 'Crema', productName: 'Crema Antirid Hyaluron C' }
      ]
    },
    {
      id: 'night_4',
      dayNumber: 4,
      title: 'Recupero',
      description: 'Consolida i risultati e calma la pelle.',
      colorTheme: 'green',
      isEnabled: true,
      steps: [
        { id: 'n4_1', label: 'Pulizia', productName: 'Hydro Boost Aqua Gel' },
        { id: 'n4_2', label: 'Trattamento', productName: 'Multi-Peptide + HA Serum' },
        { id: 'n4_3', label: 'Trattamento', productName: 'Ectoin 7% Booster' },
        { id: 'n4_4', label: 'Crema', productName: 'Crema Antirid Hyaluron C' }
      ]
    }
  ]
};