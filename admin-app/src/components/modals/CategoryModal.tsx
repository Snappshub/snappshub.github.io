import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { CategoryItem } from '../../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cat: CategoryItem) => void;
  editingCategory: CategoryItem | null;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCategory
}) => {
  const [formData, setFormData] = useState<Partial<CategoryItem>>({
    name: '',
    slug: '',
    icon: 'wrench',
    description: '',
    color: '#10b981'
  });

  useEffect(() => {
    if (editingCategory) {
      setFormData(editingCategory);
    } else {
      setFormData({
        name: '',
        slug: '',
        icon: 'wrench',
        description: '',
        color: '#10b981'
      });
    }
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const slug = formData.slug?.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const cat: CategoryItem = {
      id: editingCategory?.id || `cat-${Date.now()}`,
      name: formData.name.trim(),
      slug: slug,
      icon: formData.icon?.trim() || 'tag',
      description: formData.description?.trim() || '',
      color: formData.color || '#10b981'
    };

    onSave(cat);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <p className="text-xs text-slate-500">Organize app hub hierarchy</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  ...formData,
                  name,
                  slug: editingCategory ? formData.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                });
              }}
              placeholder="e.g. Media & Streaming"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Slug URL</label>
            <input
              type="text"
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. media-streaming"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Icon Name (Lucide)</label>
            <input
              type="text"
              value={formData.icon || 'wrench'}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="wrench, cpu, play-circle, shield-check"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Accent Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.color || '#10b981'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
              />
              <span className="text-xs font-mono text-slate-600">{formData.color}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short description of apps in this category..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingCategory ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
