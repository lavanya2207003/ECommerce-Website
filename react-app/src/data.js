export const CLOTHING_CATEGORIES = [
  'womens-dress', 'ethnic-wear', 'tops', 'kurtis', 'bottom-wear',
  'sarees', 'jeans', 't-shirts', 'shirts', 'jackets', 'hoodies',
  'womens-dresses', 'ethnic', 'kurta', 'lehenga', 'salwar', 'blouse',
  'gown', 'western-wear', 'indo-western', 'mens-clothing'
];
export const NON_CLOTHING_CATEGORIES = [
  'accessories', 'hand-bag', 'bags', 'handbags', 'jewellery', 'earrings',
  'necklaces', 'bracelets', 'watches', 'wallets', 'belts', 'sunglasses',
  'hair-accessories', 'footwear', 'shoes', 'slippers', 'sandals',
  'makeup', 'skincare', 'home-decor', 'gifts'
];

export const categories = [
  ['womens-dress', "Women's Dress", 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=600&fit=crop'],
  ['accessories', 'Accessories', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&h=600&fit=crop'],
  ['ethnic-wear', 'Ethnic Wear', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=600&fit=crop'],
  ['hand-bag', 'Hand Bag', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=600&fit=crop'],
].map(([id, name, image]) => ({ id, name, image, description: `Discover our curated ${name.toLowerCase()} collection.` }));

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const BRANDS = ['LayaStudio', 'Anvi', 'Zelora', 'VogueLine', 'Sansa', 'Meera'];

const source = [
  ['Floral Summer Dress','womens-dress',2499,'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=600&fit=crop','New'], ['Elegant Evening Gown','womens-dress',5999,'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&h=600&fit=crop',''], ['Minimal White Dress','womens-dress',3499,'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=600&fit=crop','Trending'], ['Satin Party Dress','womens-dress',4499,'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=600&fit=crop',''],
  ['Gold Bracelet','accessories',1299,'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=600&fit=crop','Best Seller'], ['Luxury Sunglasses','accessories',2499,'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=600&fit=crop',''], ['Minimal Wrist Watch','accessories',3999,'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=600&fit=crop',''], ['Pearl Necklace','accessories',1899,'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=600&fit=crop','New'],
  ['Designer Kurti','ethnic-wear',1799,'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&h=600&fit=crop',''], ['Traditional Saree','ethnic-wear',4999,'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=600&fit=crop','Premium'], ['Embroidered Salwar Set','ethnic-wear',2999,'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=500&h=600&fit=crop',''], ['Festive Lehenga','ethnic-wear',7999,'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&h=600&fit=crop','New'],
  ['Classic Leather Tote','hand-bag',5499,'https://images.unsplash.com/photo-1591561954555-607968c989ab?w=500&h=600&fit=crop','Best Seller'], ['Premium Shoulder Bag','hand-bag',4599,'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=600&fit=crop',''], ['Mini Fashion Bag','hand-bag',2999,'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500&h=600&fit=crop','Trending'], ['Luxury Office Handbag','hand-bag',6499,'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=600&fit=crop','']
];
export const products = source.map(([name,category,price,image,badge], index) => {
  const sizes = CLOTHING_CATEGORIES.includes(category) ? [...CLOTHING_SIZES] : undefined;
  return { id: index + 1, name, category, price, image, badge, sizes, brand: BRANDS[index % BRANDS.length], description: `Premium ${name.toLowerCase()} designed for effortless style.` };
});
export const newArrivals = products.slice(0, 8).map(product => ({ ...product, id: product.id + 100, badge: 'New' }));
export const bestSellers = products.filter((_, i) => i % 2 === 0).map(product => ({ ...product, id: product.id + 200, badge: 'Best Seller' }));
