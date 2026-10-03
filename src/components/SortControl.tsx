import type { SortOrder } from "../lib/collection";
export function SortControl({ value, onChange }: { value: SortOrder; onChange: (value: SortOrder) => void }) {
  return <label className="sort-control">정렬<select value={value} onChange={e => onChange(e.target.value as SortOrder)}>
    <option value="default">기본 순서</option><option value="name">이름순</option><option value="rating">평점 높은순</option>
    <option value="price-low">가격 낮은순</option><option value="price-high">가격 높은순</option>
  </select></label>;
}
