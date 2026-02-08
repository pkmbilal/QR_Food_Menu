export function groupItemsByCategory(menuItems, categoryMap) {
  const grouped = {};
  for (const item of menuItems || []) {
    const name = categoryMap?.[item.category_id] || "Uncategorized";
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(item);
  }
  return grouped;
}
