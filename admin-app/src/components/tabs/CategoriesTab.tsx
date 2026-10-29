import React from 'react';
import { Plus, Tag, Edit2, Trash2, Folder } from 'lucide-react';
import { CategoryItem, AppItem } from '../../types';

interface CategoriesTabProps {
  categories: CategoryItem[];
  apps: AppItem[];
  onOpenAddCategory: () => void;
  onOpenEditCategory: (cat: CategoryItem) => void;
  onDeleteCategory: (catId: string) => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  apps,
  onOpenAddCategory,
  onOpenEditCategory,
  onDeleteCategory
}) => {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Categories</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize apps into taxonomic sectors &bull; {categories.length} total categories
          </p>
        </div>
        <button
          onClick={onOpenAddCategory}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2.5 text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const appCount = apps.filter((a) => a.category === cat.name).length;
          return (
            <div
              key={cat.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs"
                    style={{ backgroundColor: cat.color || '#10b981' }}
                  >
                    <Folder className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {appCount} {appCount === 1 ? 'app' : 'apps'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">slug: /{cat.slug}</p>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{cat.description || 'No description provided.'}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Tag: {cat.icon}</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onOpenEditCategory(cat)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
