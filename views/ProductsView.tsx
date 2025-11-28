import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle, Moon, Sun, Search } from 'lucide-react';
import { Product, ProductType } from '../types';
import { getProducts, saveProduct } from '../services/storageService';
import { INITIAL_PRODUCTS } from '../constants';

const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<string>('Tutti');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // New Product Form State
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState<ProductType>('Crema');
  const [newUsedIn, setNewUsedIn] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  // Helper to ensure we see images even for products stored without them (fallback to initial)
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
      isIrritant: newCategory === 'Esfoliante' || newCategory === 'Retinoide',
      imageUrl: newImageUrl
    };
    saveProduct(newProduct);
    setProducts([...products, newProduct]);
    setIsFormOpen(false);
    setNewName(''); setNewBrand(''); setNewUsedIn([]); setNewImageUrl('');
  };

  const toggleUsedIn = (val: string) => {
    if (newUsedIn.includes(val)) setNewUsedIn(newUsedIn.filter(v => v !== val));
    else setNewUsedIn([...newUsedIn, val]);
  };

  const filteredProducts = filter === 'Tutti' ? products : products.filter(p => p.category === filter);

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto h-screen overflow-y-auto no-scrollbar">
      
      <div className="flex justify-between items-end mb-6 pl-2">
        <h1 className="text-2xl font-nunito font-bold text-stone-800">Shelfie</h1>
        <button 
            onClick={() => setIsFormOpen(true)}
            className="w-10 h-10 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
            <Plus size={20} />
        </button>
      </div>

      {/* Horizontal Filter Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4 mask-fade-right">
          {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setFilter(cat)}
                className={`
                    whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all
                    ${filter === cat ? 'bg-rose-400 text-white shadow-md shadow-rose-100' : 'bg-white text-stone-400 border border-stone-100'}
                `}
              >
                  {cat}
              </button>
          ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(rawProduct => {
              const product = getDisplayProduct(rawProduct);
              return (
                <div key={product.id} className="bg-white rounded-2xl p-3 pb-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-stone-50 flex flex-col h-full hover:shadow-lg transition-shadow">
                    {/* Image Area */}
                    <div className={`h-32 rounded-xl mb-3 overflow-hidden flex items-center justify-center ${product.imageUrl ? 'bg-white' : product.category === 'SPF' ? 'bg-amber-50' : product.category === 'Retinoide' ? 'bg-rose-50' : 'bg-stone-50'}`}>
                        {product.imageUrl ? (
                           <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                           <span className="text-4xl font-serif text-stone-300 opacity-50">{product.name.charAt(0)}</span>
                        )}
                    </div>
                    
                    <div className="flex flex-col flex-1">
                      <h4 className="font-nunito font-bold text-sm text-stone-800 leading-tight mb-1 line-clamp-2">{product.name}</h4>
                      <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mb-3">{product.brand || 'No Brand'}</p>
                      
                      <div className="mt-auto flex flex-wrap gap-1">
                          {product.usedIn.includes('AM') && <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center"><Sun size={10} className="text-amber-500"/></span>}
                          {product.usedIn.includes('PM') && <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center"><Moon size={10} className="text-indigo-500"/></span>}
                          {product.isIrritant && <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center"><AlertTriangle size={10} className="text-rose-500"/></span>}
                      </div>
                    </div>
                </div>
              );
          })}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-nunito font-bold mb-6 text-center">Aggiungi Tesoro</h2>
                <form onSubmit={handleAddProduct} className="space-y-5">
                    <input required value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-stone-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-rose-200" placeholder="Nome Prodotto" />
                    <input value={newBrand} onChange={e => setNewBrand(e.target.value)} className="w-full bg-stone-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-rose-200" placeholder="Brand" />
                    <input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="w-full bg-stone-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-rose-200" placeholder="URL Immagine (opzionale)" />
                    
                    <div className="grid grid-cols-2 gap-2">
                         {['AM', 'PM'].map(time => (
                             <button type="button" key={time} onClick={() => toggleUsedIn(time)} className={`py-3 rounded-xl text-xs font-bold border transition-colors ${newUsedIn.includes(time) ? 'bg-stone-800 text-white border-stone-800' : 'border-stone-200 text-stone-400'}`}>
                                 {time}
                             </button>
                         ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="py-3 rounded-xl text-stone-400 font-bold text-xs hover:bg-stone-50">ANNULLA</button>
                        <button type="submit" className="py-3 bg-rose-400 rounded-xl text-white font-bold text-xs shadow-lg shadow-rose-200">SALVA</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProductsView;