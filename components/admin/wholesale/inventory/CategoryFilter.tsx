"use client";

export interface CategoryOption {
  id: string;
  name: string;
  productCount: number;
  supplierCount: number;
}

export interface CategoryFilterProps {
  categories: CategoryOption[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-3 font-sans select-none">
      <label className="text-xs font-bold uppercase text-[#6B7280]">
        Category Filter:
      </label>
      <select
        value={selectedCategoryId}
        onChange={(e) => onSelectCategory(e.target.value)}
        className="bg-[#F7F8FA] border border-[#D0D5DD] rounded-md px-3 py-2 text-xs text-[#111318] font-bold focus:outline-none focus:border-[#2E5AAC] cursor-pointer min-w-[260px]"
      >
        <option value="ALL">All Categories (Aggregate Overview)</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name} ({cat.productCount} products, {cat.supplierCount} suppliers)
          </option>
        ))}
      </select>
    </div>
  );
}
