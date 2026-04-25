import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Package, Search, AlertTriangle, FileUp } from 'lucide-react';
import * as XLSX from 'xlsx';

const ProductManagement = ({ products, setProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedBatchProduct, setSelectedBatchProduct] = useState(null);
  const [filterColor, setFilterColor] = useState('All');
  const [formData, setFormData] = useState({
    name: '',
    unit: 'meter',
    minStock: '',
    color: 'Red',
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesColor = filterColor === 'All' || p.color === filterColor;
    return matchesSearch && matchesColor;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = {
      ...formData,
      minStock: parseInt(formData.minStock) || 0
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
    } else {
      setProducts([...products, { ...productData, id: Date.now(), variants: [] }]);
    }
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: '', unit: 'meter', minStock: '', color: 'Red' });
  };

  const editProduct = (e, product) => {
    e.stopPropagation();
    setEditingProduct(product);
    setFormData({
      name: product.name,
      unit: product.unit,
      minStock: product.minStock,
      color: product.color || 'Red'
    });
    setShowModal(true);
  };

  const deleteProduct = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const groupedProducts = data.reduce((acc, row) => {
        const productName = row.Name || row.name || 'Unnamed Product';
        if (!acc[productName]) {
          acc[productName] = {
            id: Date.now() + Math.random(),
            name: productName,
            unit: row.Unit || row.unit || 'meter',
            minStock: parseInt(row['Min Stock'] || row.minStock) || 0,
            variants: []
          };
        }

        acc[productName].variants.push({
          id: Date.now() + Math.random(),
          label: row['Batch Label'] || row.batchLabel || row.Label || 'Initial Batch',
          stock: parseInt(row.Quantity || row.quantity || row.Stock || row.stock) || 0,
          unitPrice: parseFloat(row.Price || row.price || row.Rate || row.rate) || 0,
          date: row.Date || row.date || new Date().toISOString().split('T')[0]
        });

        return acc;
      }, {});

      const newProductsList = Object.values(groupedProducts);
      
      setProducts(prevProducts => {
        let updatedList = [...prevProducts];
        
        newProductsList.forEach(newP => {
          const existingIdx = updatedList.findIndex(p => p.name.toLowerCase() === newP.name.toLowerCase());
          
          if (existingIdx > -1) {
            // Existing product found: append new variants to it
            updatedList[existingIdx] = {
              ...updatedList[existingIdx],
              variants: [...(updatedList[existingIdx].variants || []), ...newP.variants]
            };
          } else {
            // New product: add to list
            updatedList.push(newP);
          }
        });
        
        return updatedList;
      });

      alert(`Upload complete! Processed ${newProductsList.length} unique products.`);
      e.target.value = ''; // Reset input
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        "Name": "3/29 Copper",
        "Unit": "feet",
        "Min Stock": 100,
        "Batch Label": "100ft roll",
        "Quantity": 0,
        "Price": 1000,
        "Date": "2025-04-10"
      },
      {
        "Name": "3/29 Copper",
        "Unit": "feet",
        "Min Stock": 100,
        "Batch Label": "150ft roll",
        "Quantity": 10,
        "Price": 1000,
        "Date": "2025-04-11"
      },
      {
        "Name": "7/22 Aluminum",
        "Unit": "meter",
        "Min Stock": 50,
        "Batch Label": "Bulk Batch A",
        "Quantity": 500,
        "Price": 85,
        "Date": "2025-04-11"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory Template");
    XLSX.writeFile(wb, "Abbasi_Cable_Inventory_Template.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Copper Cable Products</h2>
        <div className="flex space-x-3">
          <button
            onClick={downloadTemplate}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 px-4 py-2 rounded-xl transition-all border border-slate-200 dark:border-slate-600"
          >
            <span>Download Template</span>
          </button>
          <label className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg cursor-pointer">
            <FileUp className="w-5 h-5" />
            <span>Bulk Upload</span>
            <input 
              type="file" 
              className="hidden" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleBulkUpload}
            />
          </label>
          <button
            onClick={() => { setShowModal(true); setEditingProduct(null); setFormData({ name: '', unit: 'meter', minStock: '', color: 'Red' }); }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Color:</span>
          <select 
            className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-white cursor-pointer"
            value={filterColor}
            onChange={(e) => setFilterColor(e.target.value)}
          >
            <option value="All">All Colors</option>
            <option value="Red">Red</option>
            <option value="Black">Black</option>
            <option value="Blue">Blue</option>
            <option value="Yellow">Yellow</option>
            <option value="Green">Green</option>
            <option value="White">White</option>
            <option value="Grey">Grey</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            onClick={() => setSelectedBatchProduct(product)}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-blue-400"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white" />
              </div>
              <div className="flex space-x-2">
                <button onClick={(e) => editProduct(e, product)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={(e) => deleteProduct(e, product.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{product.name}</h3>
              {product.color && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: product.color.toLowerCase() }}></span>
                  {product.color}
                </span>
              )}
            </div>

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
                  <option value="feet">Feet (ft)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Color</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  >
                    <option value="Red">Red</option>
                    <option value="Black">Black</option>
                    <option value="Blue">Blue</option>
                    <option value="Yellow">Yellow</option>
                    <option value="Green">Green</option>
                    <option value="White">White</option>
                    <option value="Grey">Grey</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Min. Stock Level</label>
                  <input
                    required
                    placeholder="00"
                    type="number"
                    min="0"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
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
      {/* Variant Details Modal */}
      {selectedBatchProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedBatchProduct.name}</h3>
                <p className="text-sm text-slate-500">Total Available: {selectedBatchProduct.stock} {selectedBatchProduct.unit}s</p>
              </div>
              <button
                onClick={() => setSelectedBatchProduct(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-sm font-semibold text-slate-500 border-b border-slate-100 dark:border-slate-700">
                      <th className="pb-3 px-2">Batch Label</th>
                      <th className="pb-3 px-2">Specs</th>
                      <th className="pb-3 px-2">Added Date</th>
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 px-2">Qty Available</th>
                      <th className="pb-3 px-2">Unit Price</th>
                      <th className="pb-3 px-2 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {selectedBatchProduct.variants && selectedBatchProduct.variants.length > 0 ? (
                      selectedBatchProduct.variants.map((v) => {
                        const isNew = v.date && (new Date() - new Date(v.date)) / (1000 * 60 * 60 * 24) < 7;

                        return (
                          <tr key={v.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="py-4 px-2 font-medium text-slate-800 dark:text-slate-200">{v.label}</td>
                            <td className="py-4 px-2">
                              <div className="flex flex-col gap-1">
                                {v.size && <span className="text-[10px] text-slate-500 font-medium">Size: {v.size}mm</span>}
                                {v.type && <span className="text-[10px] text-slate-500 font-medium">Type: {v.type}</span>}
                                {v.core && <span className="text-[10px] text-slate-500 font-medium">Core: {v.core}</span>}
                                {!v.size && !v.type && !v.core && <span className="text-[10px] text-slate-400">---</span>}
                              </div>
                            </td>
                            <td className="py-4 px-2 text-slate-500">{v.date || '---'}</td>
                            <td className="py-4 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isNew
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                }`}>
                                {isNew ? 'New' : 'Old'}
                              </span>
                            </td>
                            <td className="py-4 px-2 font-semibold text-blue-600 dark:text-blue-400">
                              {v.stock} {selectedBatchProduct.unit}s
                            </td>
                            <td className="py-4 px-2 text-slate-600 dark:text-slate-400">Rs. {v.unitPrice}</td>
                            <td className="py-4 px-2 text-right font-bold text-slate-800 dark:text-slate-200">
                              Rs. {(v.stock * v.unitPrice).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-500 italic">No active batches available. Please add stock via Purchase.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 text-right">
              <button
                onClick={() => setSelectedBatchProduct(null)}
                className="px-6 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
