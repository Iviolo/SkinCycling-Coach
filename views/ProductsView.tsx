import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle, Moon, Sun, Search, X, Check, Info, FileText, Zap, Calendar, Hourglass } from 'lucide-react';
import { Product, ProductType } from '../types';
import { getProducts, saveProduct, saveProducts, addProductToRoutine, removeProductFromRoutine } from '../services/storageService';
import { INITIAL_PRODUCTS, NIGHT_COLORS } from '../constants';
import { addMonths, isPast, format, parseISO } from 'date-fns';
import it from 'date-fns/locale/it';

const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<string>('Tutti');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // New Product Form State
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState<ProductType>('Crema');
  const [newUsedIn, setNewUsedIn] = useState<string[]>([]);
  const [newCycleNights, setNewCycleNights] = useState<number[]>([]); 
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newUsageAdvice, setNewUsageAdvice] = useState('');
  const [newDateOpened, setNewDateOpened] = useState('');
  const [newPao, setNewPao] = useState<number | ''>('');

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const getDisplayProduct = (p: Product): Product => {
     if (p.imageUrl) return p;
     const initial = INITIAL_PRODUCTS.find(ip => ip.id === p.id || ip.name === p.name);
     if (initial && initial.imageUrl) return { ...p, imageUrl: initial.imageUrl };
     return p;
  };

  const categories = ['Tutti', 'Detergente', 'Siero', 'Crema', 'Esfoliante', 'Retinoide', 'SPF', 'Trattamento'];

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: Date.now().toString(),
      name: newName,
      brand: newBrand,
      category: newCategory,
      usedIn: newUsedIn as ('AM' | 'PM')[],
      cycleNights: newUsedIn.includes('PM') ? newCycleNights : [],
      isIrritant: newCategory === 'Esfoliante' || newCategory === 'Retinoide',
      imageUrl: newImageUrl,
      description: newDescription,
      usageAdvice: newUsageAdvice,
      dateOpened: newDateOpened || undefined,
      pao: newPao !== '' ? Number(newPao) : undefined
    };
    
    setProducts(prev => {
        const updated = [...prev, newProduct];
        saveProducts(updated); 
        return updated;
    });

    addProductToRoutine(newProduct);

    setIsFormOpen(false);
    setNewName(''); setNewBrand(''); setNewUsedIn([]); setNewCycleNights([]); setNewImageUrl(''); 
    setNewDescription(''); setNewUsageAdvice(''); setNewDateOpened(''); setNewPao('');
  };

  const handleDeleteProduct = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    const productToDelete = products.find(p => p.id === id);
    if (productToDelete) {
        removeProductFromRoutine(productToDelete.name);
    }

    setProducts(prev => {
        const updated = prev.filter(p => p.id !== id);
        saveProducts(updated); 
        return updated;
    });
  };

  const toggleUsedIn = (val: string) => {
    if (newUsedIn.includes(val)) {
        setNewUsedIn(newUsedIn.filter(v => v !== val));
        if (val === 'PM') setNewCycleNights([]); 
    } else {
        setNewUsedIn([...newUsedIn, val]);
        if (val === 'PM') setNewCycleNights([1, 2, 3, 4]); 
    }
  };

  const toggleCycleNight = (night: number) => {
    if (newCycleNights.includes(night)) {
        setNewCycleNights(newCycleNights.filter(n => n !== night));
    } else {
        setNewCycleNights([...newCycleNights, night].sort());
    }
  };

  const getExpirationInfo = (product: Product) => {
      if (!product.dateOpened || !product.pao) return null;
      try {
          const opened = parseISO(product.dateOpened);
          const expires = addMonths(opened, product.pao);
          const isExpired = isPast(expires);
          return { expires, isExpired };
      } catch (e) {
          return null;
      }
  };

  const filteredProducts = filter === 'Tutti' ? products : products.filter(p => p.category === filter);

  const getNightColor = (n: number) => {
      if (n === 1) return NIGHT_COLORS.night_1;
      if (n === 2) return NIGHT_COLORS.night_2;
      return NIGHT_COLORS.night_3_4;
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto h-screen overflow-y-auto no-scrollbar relative">
      
      <div className="flex justify-between items-end mb-6 pl-2 drop-shadow-sm">
        <h1 className="text-2xl font-nunito font-bold text-stone-900">Dossier Prodotti</h1>
        <button 
            onClick={() => setIsFormOpen(true)}
            className="w-10 h-10 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
            <Plus size={20} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4 mask-fade-right">
          {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setFilter(cat)}
                className={`
                    whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all backdrop-blur-md
                    ${filter === cat ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'bg-white/70 text-stone-700 border border-white/60 hover:bg-white/90'}
                `}
              >
                  {cat}
              </button>
          ))}
      </div>

      <div className="space-y-4">
          {filteredProducts.map(rawProduct => {
              const product = getDisplayProduct(rawProduct);
              const isExpanded = expandedId === product.id;
              const expInfo = getExpirationInfo(product);

              return (
                <div 
                    key={product.id} 
                    className={`relative bg-white/80 backdrop-blur-md rounded-[1.5rem] p-4 shadow-lg border border-white/60 transition-all duration-300 ${isExpanded ? 'ring-2 ring-rose-200 bg-white/95' : 'hover:bg-white/90'}`}
                    onClick={() => setExpandedId(isExpanded ? null : product.id)}
                >
                    <div className="flex gap-4">
                        <div className={`w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-stone-100 shrink-0 relative`}>
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-serif text-stone-400 opacity-50">{product.name.charAt(0)}</span>
                            )}
                            {expInfo?.isExpired && (
                                <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center backdrop-blur-[2px]">
                                    <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-full shadow-sm">SCADUTO</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] text-stone-600 font-bold uppercase tracking-wider mb-0.5">{product.brand || 'No Brand'}</p>
                                    <h4 className="font-nunito font-bold text-base text-stone-900 leading-tight mb-1 pr-6">{product.name}</h4>
                                </div>
                                <button 
                                    onClick={(e) => handleDeleteProduct(product.id, e)}
                                    className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-auto items-center">
                                {product.category && (
                                    <span className="px-2 py-0.5 rounded-md bg-stone-100/50 text-[10px] font-bold text-stone-600 border border-stone-200/50">
                                        {product.category}
                                    </span>
                                )}
                                {expInfo && !expInfo.isExpired && (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-600 border border-emerald-100 flex items-center gap-1">
                                        <Hourglass size={8} />
                                        {format(expInfo.expires, 'MM/yy')}
                                    </span>
                                )}
                                {product.usedIn.includes('PM') && <span className="w-5 h-5 rounded-full bg-indigo-100/60 flex items-center justify-center"><Moon size={10} className="text-indigo-600"/></span>}
                                {product.isIrritant && <span className="w-5 h-5 rounded-full bg-rose-100/60 flex items-center justify-center"><AlertTriangle size={10} className="text-rose-500"/></span>}
                            </div>
                        </div>
                    </div>

                    {/* Expanded Technical Sheet */}
                    {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-stone-200/50 space-y-3 animate-fade-in">
                            
                            {(product.description || product.notes) && (
                                <div className="bg-white/60 p-3 rounded-xl border border-white/60">
                                    <div className="flex items-center gap-2 mb-1 text-stone-800">
                                        <FileText size={14} className="text-rose-500" />
                                        <h5 className="text-xs font-bold uppercase tracking-wider">Dati Tecnici</h5>
                                    </div>
                                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                                        {product.description || product.notes}
                                    </p>
                                </div>
                            )}

                            {product.dateOpened && product.pao && (
                                <div className={`p-3 rounded-xl border flex items-center gap-3 ${expInfo?.isExpired ? 'bg-red-50 border-red-100' : 'bg-stone-50 border-stone-100'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${expInfo?.isExpired ? 'bg-red-100 text-red-600' : 'bg-stone-200 text-stone-600'}`}>
                                        <Calendar size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-stone-500">Aperto il {format(parseISO(product.dateOpened), 'd MMM yyyy', {locale: it})}</p>
                                        <p className={`text-xs font-bold ${expInfo?.isExpired ? 'text-red-600' : 'text-stone-800'}`}>
                                            {expInfo?.isExpired ? 'SCADUTO' : `Scade il ${format(expInfo!.expires, 'd MMMM yyyy', {locale: it})}`}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {product.usedIn.includes('PM') && product.cycleNights && product.cycleNights.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] font-bold text-stone-500 uppercase">Notti Ciclo:</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map(n => {
                                            const isActive = product.cycleNights?.includes(n);
                                            const color = getNightColor(n);
                                            return isActive ? (
                                                <div 
                                                    key={n} 
                                                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {n}
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {!isExpanded && (product.description || product.usageAdvice) && (
                        <div className="absolute bottom-4 right-4 animate-pulse">
                            <Info size={16} className="text-rose-400" />
                        </div>
                    )}
                </div>
              );
          })}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="bg-white/95 backdrop-blur-xl w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto border border-white/60">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-nunito font-bold">Aggiungi Tesoro</h2>
                    <button onClick={() => setIsFormOpen(false)} className="p-1 bg-stone-100/80 rounded-full text-stone-500"><X size={18}/></button>
                </div>
                
                <form onSubmit={handleAddProduct} className="space-y-5">
                    <input required value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-white/60 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-rose-200 border border-white/60 placeholder-stone-400" placeholder="Nome Prodotto" />
                    <input value={newBrand} onChange={e => setNewBrand(e.target.value)} className="w-full bg-white/60 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-rose-200 border border-white/60 placeholder-stone-400" placeholder="Brand" />
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 ml-1">Categoria</label>
                        <select 
                            value={newCategory} 
                            onChange={e => setNewCategory(e.target.value as ProductType)}
                            className="w-full bg-white/60 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-rose-200 border border-white/60"
                        >
                            {categories.filter(c => c !== 'Tutti').map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                             <label className="text-[10px] font-bold text-stone-500 ml-1">Data Apertura</label>
                             <input type="date" value={newDateOpened} onChange={e => setNewDateOpened(e.target.value)} className="w-full bg-white/60 rounded-xl px-3 py-3 text-sm outline-none border border-white/60" />
                        </div>
                        <div className="space-y-1">
                             <label className="text-[10px] font-bold text-stone-500 ml-1">PAO (Mesi)</label>
                             <input type="number" placeholder="Es. 12" value={newPao} onChange={e => setNewPao(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/60 rounded-xl px-3 py-3 text-sm outline-none border border-white/60" />
                        </div>
                    </div>

                    <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} className="w-full bg-white/60 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-rose-200 border border-white/60 placeholder-stone-400 min-h-[80px]" placeholder="Dati Tecnici e Funzione" />
                    
                    <textarea value={newUsageAdvice} onChange={e => setNewUsageAdvice(e.target.value)} className="w-full bg-white/60 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-rose-200 border border-white/60 placeholder-stone-400 min-h-[60px]" placeholder="Consigli di Applicazione" />

                    <input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="w-full bg-white/60 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-rose-200 border border-white/60 placeholder-stone-400" placeholder="URL Immagine (opzionale)" />
                    
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-stone-500 ml-1">Quando lo usi?</label>
                        <div className="grid grid-cols-2 gap-2">
                             {['AM', 'PM'].map(time => (
                                 <button type="button" key={time} onClick={() => toggleUsedIn(time)} className={`py-3 rounded-xl text-xs font-bold border transition-colors ${newUsedIn.includes(time) ? 'bg-stone-800 text-white border-stone-800' : 'border-stone-200/50 text-stone-500 bg-white/60'}`}>
                                     {time}
                                 </button>
                             ))}
                        </div>

                        {newUsedIn.includes('PM') && (
                            <div className="bg-white/60 p-3 rounded-xl border border-white/60 animate-fade-in">
                                <label className="text-[10px] font-bold text-stone-500 mb-2 block uppercase tracking-wider">Quali notti del ciclo?</label>
                                <div className="flex justify-between gap-2">
                                    {[1, 2, 3, 4].map(n => {
                                        const isActive = newCycleNights.includes(n);
                                        const color = getNightColor(n);
                                        return (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => toggleCycleNight(n)}
                                                className={`
                                                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border transition-all
                                                    ${isActive ? 'scale-110 shadow-md' : 'opacity-80 bg-white/70 border-stone-200/50'}
                                                `}
                                                style={isActive ? { backgroundColor: color, color: 'white', borderColor: color } : { color: '#78716c' }}
                                            >
                                                {n}
                                                {isActive && <div className="absolute -bottom-1 w-1 h-1 bg-current rounded-full"></div>}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="w-full py-3 bg-rose-400 rounded-xl text-white font-bold text-xs shadow-lg shadow-rose-200 mt-4">SALVA E AGGIUNGI AL CICLO</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProductsView;