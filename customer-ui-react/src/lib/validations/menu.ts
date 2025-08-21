import { z } from 'zod'

// 搜尋關鍵字驗證
export const searchQuerySchema = z
  .string()
  .max(50, '搜尋關鍵字不能超過50個字符')
  .optional()

// 分類驗證
export const categorySchema = z
  .enum(['all', 'appetizer', 'main', 'dessert', 'beverage'] as const)
  .optional()

// 價格範圍驗證
export const priceRangeSchema = z.object({
  min: z.number().min(0, '最低價格不能小於0').max(10000, '最低價格不能超過10000'),
  max: z.number().min(0, '最高價格不能小於0').max(10000, '最高價格不能超過10000')
}).refine((data) => data.min <= data.max, {
  message: '最低價格不能大於最高價格',
  path: ['min']
})

export type PriceRangeFormData = z.infer<typeof priceRangeSchema>

// 菜單篩選驗證
export const menuFilterSchema = z.object({
  search: searchQuerySchema,
  category: categorySchema,
  priceRange: priceRangeSchema.optional(),
  availableOnly: z.boolean().optional(),
  popularOnly: z.boolean().optional(),
  vegetarianOnly: z.boolean().optional(),
  spicyOnly: z.boolean().optional(),
  sortBy: z.enum(['name', 'price_asc', 'price_desc', 'rating', 'popular'] as const).optional()
})

export type MenuFilterFormData = z.infer<typeof menuFilterSchema>

// 商品評論驗證
export const menuItemReviewSchema = z.object({
  menuItemId: z.number().int().positive('無效的商品ID'),
  rating: z.number().min(1, '評分至少為1').max(5, '評分最高為5').int('評分必須為整數'),
  title: z.string().min(1, '請輸入評論標題').max(50, '標題不能超過50個字符'),
  comment: z.string().min(10, '評論至少需要10個字符').max(500, '評論不能超過500個字符'),
  photos: z.array(z.string().url('無效的圖片連結')).max(5, '最多上傳5張照片').optional(),
  tags: z.array(z.string().max(20, '標籤不能超過20個字符')).max(10, '最多選擇10個標籤').optional()
})

export type MenuItemReviewFormData = z.infer<typeof menuItemReviewSchema>

// 商品詳情表單驗證（用於加入購物車）
export const menuItemOrderSchema = z.object({
  menuItemId: z.number().int().positive('無效的商品ID'),
  quantity: z.number().min(1, '數量至少為1').max(99, '數量不能超過99').int('數量必須為整數'),
  specialRequests: z.string().max(200, '特殊需求不能超過200個字符').optional(),
  selectedOptions: z.record(z.string(), z.any()).optional(), // 用於未來的商品選項功能
  estimatedTime: z.number().int().positive().optional() // 預估製作時間
})

export type MenuItemOrderFormData = z.infer<typeof menuItemOrderSchema>

// 商品收藏驗證
export const favoriteSchema = z.object({
  menuItemId: z.number().int().positive('無效的商品ID'),
  action: z.enum(['add', 'remove'] as const)
})

export type FavoriteFormData = z.infer<typeof favoriteSchema>

// 商品比較驗證
export const compareItemsSchema = z.object({
  itemIds: z.array(z.number().int().positive()).min(2, '至少需要選擇2個商品').max(4, '最多比較4個商品'),
  criteria: z.array(z.enum(['price', 'rating', 'calories', 'prep_time'] as const)).optional()
})

export type CompareItemsFormData = z.infer<typeof compareItemsSchema>

// 營養資訊搜尋驗證
export const nutritionFilterSchema = z.object({
  maxCalories: z.number().min(0).max(5000).optional(),
  minProtein: z.number().min(0).max(200).optional(),
  maxCarbs: z.number().min(0).max(500).optional(),
  maxFat: z.number().min(0).max(200).optional(),
  maxSodium: z.number().min(0).max(5000).optional(),
  allergens: z.array(z.string()).optional()
})

export type NutritionFilterFormData = z.infer<typeof nutritionFilterSchema>