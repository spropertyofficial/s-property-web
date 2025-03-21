import React from "react";
import CategoryItem from "./components/CategoryItem";
import { CATEGORY_ITEMS } from "./components/Constants";

export default function PropertyCategoryMenu() {
  return (
    <nav
      className="px-6 py-6 bg-white rounded-lg shadow-sm"
      aria-label="Kategori Properti"
    >
      <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
        {CATEGORY_ITEMS.map((category) => (
          <CategoryItem key={category.label} {...category} />
        ))}
      </div>
    </nav>
  );
}
