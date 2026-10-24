import { supabase } from '@/lib/supabase';
import type { Category } from '@/types/domain';

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, label')
    .order('sort', { ascending: true });
  if (error) throw error;
  // artisanCount (compteur affiché sur les puces de catégorie) : recalculé en direct plutôt
  // que stocké — src/mocks/data.ts le portait en dur, mais rien ne le maintenait à jour.
  const counts = await supabase.from('artisan_categories').select('category_id');
  if (counts.error) throw counts.error;
  const countByCategory = new Map<string, number>();
  for (const row of counts.data) {
    countByCategory.set(row.category_id, (countByCategory.get(row.category_id) ?? 0) + 1);
  }
  return data.map((c) => ({
    id: c.id as Category['id'],
    label: c.label,
    artisanCount: countByCategory.get(c.id) ?? 0,
  }));
}
