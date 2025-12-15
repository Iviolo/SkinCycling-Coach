import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle, Moon, Sun, Search, X, Check } from 'lucide-react';
import { Product, ProductType } from '../types';
import { getProducts, saveProduct, saveProducts, addProductToRoutine, removeProductFromRoutine } from '../services/storageService';
import { INITIAL_PRODUCTS, NIGHT_COLORS } from '../constants';

const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<string>('Tutti');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // New Product Form State
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState<ProductType>('Crema');
  const [newUsedIn, setNewUsedIn] = useState<string[]>([]);
  const [newCycleNights, setNewCycleNights] = useState<number[]>([]); // Track specific nights 1,2,3,4
  const [newImageUrl, setNewImageUrl] = useState('');

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
      imageUrl: newImageUrl
    };
    
    setProducts(prev => {
        const updated = [...prev, newProduct];
        saveProducts(updated); 
        return updated;
    });

    addProductToRoutine(newProduct);

    setIsFormOpen(false);
    setNewName(''); setNewBrand(''); setNewUsedIn([]); setNewCycleNights([]); setNewImageUrl('');
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

  const filteredProducts = filter === 'Tutti' ? products : products.filter(p => p.category === filter);

  const getNightColor = (n: number) => {
      if (n === 1) return NIGHT_COLORS.night_1;
      if (n === 2) return NIGHT_COLORS.night_2;
      return NIGHT_COLORS.night_3_4;
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto h-screen overflow-y-auto no-scrollbar relative">
      
      <div className="flex justify-between items-end mb-6 pl-2 drop-shadow-sm">
        <h1 className="text-2xl font-nunito font-bold text-stone-900">Shelfie</h1>
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
                    ${filter === cat ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'bg-white/40 text-stone-700 border border-white/40 hover:bg-white/60'}
                `}
              >
                  {cat}
              </button>
          ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(rawProduct => {
              const product = getDisplayProduct(rawProduct);
              return (
                <div key={product.id} className="relative group bg-white/30 backdrop-blur-md rounded-2xl p-3 pb-4 shadow-lg border border-white/30 flex flex-col h-full hover:bg-white/50 transition-all">
                    
                    <button 
                        onClick={(e) => handleDeleteProduct(product.id, e)}
                        className="absolute -top-2 -right-2 z-20 w-10 h-10 flex items-center justify-center"
                    >
                        <div className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-400 shadow-md border border-stone-100 hover:text-red-500 hover:scale-110 transition-all">
                            <Trash2 size={12} />
                        </div>
                    </button>

                    <div className={`h-32 rounded-xl mb-3 overflow-hidden flex items-center justify-center bg-white/30 border border-white/30`}>
                        {product.imageUrl ? (
                           <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                           <span className="text-4xl font-serif text-stone-400 opacity-50">{product.name.charAt(0)}</span>
                        )}
                    </div>
                    
                    <div className="flex flex-col flex-1">
                      <h4 className="font-nunito font-bold text-sm text-stone-800 leading-tight mb-1 line-clamp-2 pr-4">{product.name}</h4>
                      <p className="text-[10px] text-stone-600 font-medium uppercase tracking-wider mb-3">{product.brand || 'No Brand'}</p>
                      
                      <div className="mt-auto flex flex-wrap gap-1">
                          {product.usedIn.includes('AM') && <span className="w-5 h-5 rounded-full bg-amber-100/60 flex items-center justify-center"><Sun size={10} className="text-amber-600"/></span>}
                          {product.usedIn.includes('PM') && <span className="w-5 h-5 rounded-full bg-indigo-100/60 flex items-center justify-center"><Moon size={10} className="text-indigo-600"/></span>}
                          {product.isIrritant && <span className="w-5 h-5 rounded-full bg-rose-100/60 flex items-center justify-center"><AlertTriangle size={10} className="text-rose-500"/></span>}
                          
                          {/* Mini badges */}
                          {product.usedIn.includes('PM') && product.cycleNights && product.cycleNights.length > 0 && product.cycleNights.length < 4 && (
                              <span className="h-5 px-1.5 rounded-full bg-stone-100/60 flex items-center justify-center text-[8px] font-bold text-stone-600">
                                  {product.cycleNights.join(',')}
                              </span>
                          )}
                      </div>
                    </div>
                </div>
              );
          })}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto border border-white/40">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-nunito font-bold">Aggiungi Tesoro</h2>
                    <button onClick={() => setIsFormOpen(false)} className="p-1 bg-stone-100/50 rounded-full text-stone-500"><X size={18}/></button>
                </div>
                
                <form onSubmit={handleAddProduct} className="space-y-5">
                    <input required value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-white/40 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-rose-200 border border-white/40 placeholder-stone-400" placeholder="Nome Prodotto" />
                    <input value={newBrand} onChange={e => setNewBrand(e.target.value)} className="w-full bg-white/40 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-rose-200 border border-white/40 placeholder-stone-400" placeholder="Brand" />
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 ml-1">Categoria</label>
                        <select 
                            value={newCategory} 
                            onChange={e => setNewCategory(e.target.value as ProductType)}
                            className="w-full bg-white/40 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-rose-200 border border-white/40"
                        >
                            {categories.filter(c => c !== 'Tutti').map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="w-full bg-white/40 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-rose-200 border border-white/40 placeholder-stone-400" placeholder="URL Immagine (opzionale)" />
                    
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-stone-500 ml-1">Quando lo usi?</label>
                        <div className="grid grid-cols-2 gap-2">
                             {['AM', 'PM'].map(time => (
                                 <button type="button" key={time} onClick={() => toggleUsedIn(time)} className={`py-3 rounded-xl text-xs font-bold border transition-colors ${newUsedIn.includes(time) ? 'bg-stone-800 text-white border-stone-800' : 'border-stone-200/50 text-stone-500 bg-white/30'}`}>
                                     {time}
                                 </button>
                             ))}
                        </div>

                        {newUsedIn.includes('PM') && (
                            <div className="bg-white/30 p-3 rounded-xl border border-white/40 animate-fade-in">
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
                                                    ${isActive ? 'scale-110 shadow-md' : 'opacity-60 bg-white/50 border-stone-200/50'}
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