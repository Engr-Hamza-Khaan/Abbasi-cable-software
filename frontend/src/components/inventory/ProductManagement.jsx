import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Package, Search, AlertTriangle } from 'lucide-react';

const ProductManagement = ({ products, setProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: 'meter',
    minStock: 0,
    stock: 0
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...formData, id: p.id } : p));
    } else {
      setProducts([...products, { ...formData, id: Date.now() }]);
    }
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: '', unit: 'meter', minStock: 0, stock: 0 });
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowModal(true);
  };

  const deleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Copper Cable Products</h2>
        <button 
          onClick={() => { setShowModal(true); setEditingProduct(null); setFormData({ name: '', unit: 'meter', minStock: 0, stock: 0 }); }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex space-x-2">
                <button onClick={() => editProduct(product)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteProduct(product.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{product.name}</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Current Stock</span>
                <span className={`font-bold ${product.stock <= product.minStock ? 'text-red-500 flex items-center gap-1' : 'text-slate-800 dark:text-slate-200'}`}>
                  {product.stock} {product.unit}s
                  {product.stock <= product.minStock && <AlertTriangle className="w-4 h-4" />}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Min. Stock Level</span>
                <span className="text-slate-800 dark:text-slate-200">{product.minStock} {product.unit}s</span>
              </div>
              
              {/* Stock Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${product.stock <= product.minStock ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min((product.stock / (product.minStock * 2 || 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Product Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Unit</label>
                <select
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="meter">Meter</option>
                  <option value="roll">Roll</option>
                  <option value="kg">KG</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Current Stock</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Min. Stock Level</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg font-medium"
                >
                  {editingProduct ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
