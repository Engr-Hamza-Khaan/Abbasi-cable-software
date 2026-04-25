import React, { useState, useEffect } from 'react';
import { Upload, Download, Image as ImageIcon, Trash2, FileImage, ShieldCheck, ChevronDown, FileText } from 'lucide-react';

const Manufacturing = () => {
  const [images, setImages] = useState([]);
  const [openId, setOpenId] = useState(null);

  // Load images from localStorage on mount
  useEffect(() => {
    const savedImages = localStorage.getItem('manufacturing_batch_images');
    if (savedImages) {
      try {
        const parsed = JSON.parse(savedImages);
        setImages(parsed);
        if (parsed.length > 0) setOpenId(parsed[0].id);
      } catch (e) {
        console.error("Error parsing saved images", e);
      }
    }
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = [];
    let processedCount = 0;

    files.forEach((file) => {
      // Check file size (limit to 2MB per file to be safer with localStorage limits)
      if (file.size > 2 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Limit is 2MB per file for local storage.`);
        processedCount++;
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          base64: reader.result,
          date: new Date().toLocaleString()
        };
        newImages.push(imageData);
        processedCount++;

        if (processedCount === files.length) {
          updateImagesState(newImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const updateImagesState = (newOnes) => {
    const updatedList = [...images, ...newOnes];
    setImages(updatedList);
    localStorage.setItem('manufacturing_batch_images', JSON.stringify(updatedList));
    if (newOnes.length > 0) setOpenId(newOnes[0].id); // Open the latest one
  };

  const downloadImage = (img) => {
    const link = document.createElement('a');
    link.href = img.base64;
    link.download = img.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeImage = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this record?")) {
      const updatedList = images.filter(img => img.id !== id);
      setImages(updatedList);
      localStorage.setItem('manufacturing_batch_images', JSON.stringify(updatedList));
      if (openId === id) setOpenId(updatedList.length > 0 ? updatedList[0].id : null);
    }
  };

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
            Manufacturing <span className="text-indigo-600">Queue</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage multiple production records and images</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="file"
            id="imageUpload"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />
          <label
            htmlFor="imageUpload"
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            Add to Queue
          </label>
        </div>
      </div>

      {images.length > 0 ? (
        <div className="grid gap-4">
          {images.map((img) => (
            <div 
              key={img.id}
              className={`group overflow-hidden rounded-[2rem] border transition-all duration-300 ${
                openId === img.id 
                ? 'bg-white dark:bg-slate-900 border-indigo-500/30 shadow-2xl ring-1 ring-indigo-500/10' 
                : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              {/* Accordion Header */}
              <div 
                onClick={() => toggleAccordion(img.id)}
                className="flex items-center justify-between p-6 cursor-pointer select-none"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl transition-colors ${openId === img.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className={`font-bold text-lg truncate transition-colors ${openId === img.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                      {img.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{img.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadImage(img); }}
                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden sm:block"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => removeImage(img.id, e)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className={`transition-transform duration-300 ${openId === img.id ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-6 h-6 text-slate-300" />
                  </div>
                </div>
              </div>

              {/* Accordion Content */}
              <div 
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  openId === img.id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-8 pt-2">
                  <div className="relative rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 flex items-center justify-center min-h-[300px] p-4">
                     <img 
                      src={img.base64} 
                      alt={img.name} 
                      className="max-w-full max-h-[60vh] object-contain shadow-2xl rounded-xl"
                    />
                    
                    {/* Actions and Info */}
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-500/20 shadow-lg">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Digital Record Secured
                      </div>
                      <button
                        onClick={() => downloadImage(img)}
                        className="sm:hidden flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden min-h-[500px] flex flex-col items-center justify-center">
            <div className="max-w-md mx-auto text-center space-y-8 p-12">
              <div className="relative">
                <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mx-auto transform -rotate-6 group-hover:rotate-0 transition-all duration-500 shadow-inner">
                  <ImageIcon className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Queue is Empty</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg">
                  Upload multiple photos of the manufacturing batch to keep them organized in a digital queue.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <label
                  htmlFor="imageUpload"
                  className="cursor-pointer text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-500 flex items-center gap-2 group"
                >
                  <FileImage className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  Select multiple files
                </label>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  PNG • JPG • WEBP • Max 2MB per file
                </div>
              </div>
            </div>

            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Manufacturing;
