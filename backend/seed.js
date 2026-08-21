const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const Admin = require("./models/Admin");
const Product = require("./models/Product");
const Customer = require("./models/Customer");

const U = (id) => `https://images.unsplash.com/photo-${id}?w=500&h=600&fit=crop`;

const sampleProducts = [
  // ---------- Women's Dresses ----------
  { name: "Floral Summer Dress", sku: "LSD-001", description: "Premium floral summer dress designed for effortless style.", category: "womens-dress", brand: "LayaStudio", price: 2499, discount_price: 0, discount_percent: 0, stock: 45, images: [U("1572804013309-59a88b7e92f1")], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "New", is_featured: true, tags: ["summer", "floral", "dress"] },
  { name: "Elegant Evening Gown", sku: "LSD-002", description: "Premium elegant evening gown designed for effortless style.", category: "womens-dress", brand: "Anvi", price: 5999, discount_price: 4999, discount_percent: 17, stock: 20, images: [U("1566174053879-31528523f8ae")], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "", is_featured: true, tags: ["evening", "gown", "party"] },
  { name: "Minimal White Dress", sku: "LSD-003", description: "Premium minimal white dress designed for effortless style.", category: "womens-dress", brand: "Zelora", price: 3499, discount_price: 0, discount_percent: 0, stock: 30, images: [U("1595777457583-95e059d581b8")], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "Trending", is_featured: false, tags: ["minimal", "white", "casual"] },
  { name: "Satin Party Dress", sku: "LSD-004", description: "Premium satin party dress designed for effortless style.", category: "womens-dress", brand: "VogueLine", price: 4499, discount_price: 3999, discount_percent: 11, stock: 15, images: ["https://pomuyoo.com/cdn/shop/products/Evie-Luxurious-Cowl-Slit-Satin-Party-Blushing_Pink-Dresses-1.jpg?v=1708493627"], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "", is_featured: false, tags: ["satin", "party", "dress"] },
  { name: "Chiffon Maxi Dress", sku: "LSD-005", description: "Flowy chiffon maxi dress with a flattering A-line silhouette, perfect for summer evenings.", category: "womens-dress", brand: "LayaStudio", price: 3299, discount_price: 0, discount_percent: 0, stock: 40, images: [U("1496747611176-843222e1e57c")], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "New", is_featured: true, tags: ["chiffon", "maxi", "summer"] },
  { name: "Polka Dot Midi Dress", sku: "LSD-006", description: "Playful polka dot midi dress with a fitted waist and flared hem for a classic retro look.", category: "womens-dress", brand: "Zelora", price: 2799, discount_price: 2399, discount_percent: 14, stock: 35, images: [U("1539008835657-9e8e9680c956")], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "Trending", is_featured: false, tags: ["polka", "midi", "casual"] },
  { name: "Sequin Cocktail Dress", sku: "LSD-007", description: "Statement sequin cocktail dress that shimmers under lights, ideal for parties and receptions.", category: "womens-dress", brand: "VogueLine", price: 5299, discount_price: 4699, discount_percent: 11, stock: 18, images: [U("1515372039744-b8f02a3ae446")], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "Premium", is_featured: true, tags: ["sequin", "cocktail", "party"] },
  { name: "Bohemian Wrap Dress", sku: "LSD-008", description: "Effortless bohemian wrap dress in breathable fabric, great for daytime outings.", category: "womens-dress", brand: "Anvi", price: 1999, discount_price: 0, discount_percent: 0, stock: 50, images: [U("1469334031218-e382a71b716b")], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "", is_featured: false, tags: ["boho", "wrap", "summer"] },
  { name: "Velvet Bodycon Dress", sku: "LSD-009", description: "Luxe velvet bodycon dress with a sculpted fit, designed for evening glamour.", category: "womens-dress", brand: "Meera", price: 3899, discount_price: 3499, discount_percent: 10, stock: 22, images: [U("1485968579580-b6d095142e6e")], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "", is_featured: false, tags: ["velvet", "bodycon", "party"] },
  { name: "Floral Wrap Gown", sku: "LSD-010", description: "Elegant floral wrap gown with a sweeping skirt for formal occasions.", category: "womens-dress", brand: "Sansa", price: 4599, discount_price: 0, discount_percent: 0, stock: 15, images: [U("1539109136881-3be0616acf4b")], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "New", is_featured: true, tags: ["floral", "gown", "elegant"] },
  { name: "Ruffled Summer Dress", sku: "LSD-011", description: "Lightweight ruffled summer dress with tiered layers for a breezy feminine vibe.", category: "womens-dress", brand: "LayaStudio", price: 2299, discount_price: 1999, discount_percent: 13, stock: 45, images: [U("1591047139829-d91aecb6caea")], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "", is_featured: false, tags: ["ruffle", "summer", "casual"] },
  { name: "Off-Shoulder Midi Dress", sku: "LSD-012", description: "Chic off-shoulder midi dress with a smocked bodice, perfect for date nights.", category: "womens-dress", brand: "Zelora", price: 3099, discount_price: 2799, discount_percent: 10, stock: 28, images: [U("1620799140408-edc6dcb6d633")], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "Trending", is_featured: false, tags: ["off-shoulder", "midi", "party"] },

  // ---------- Accessories ----------
  { name: "Gold Bracelet", sku: "LAC-001", description: "Premium gold bracelet designed for effortless style.", category: "accessories", brand: "Sansa", price: 1299, discount_price: 0, discount_percent: 0, stock: 60, images: [U("1611591437281-460bfbe1220a")], sizes: [], badge: "Best Seller", is_featured: true, tags: ["gold", "bracelet", "jewellery"] },
  { name: "Luxury Sunglasses", sku: "LAC-002", description: "Premium luxury sunglasses designed for effortless style.", category: "accessories", brand: "Meera", price: 2499, discount_price: 1999, discount_percent: 20, stock: 35, images: [U("1572635196237-14b3f281503f")], sizes: [], badge: "", is_featured: false, tags: ["sunglasses", "luxury", "summer"] },
  { name: "Minimal Wrist Watch", sku: "LAC-003", description: "Premium minimal wrist watch designed for effortless style.", category: "accessories", brand: "LayaStudio", price: 3999, discount_price: 0, discount_percent: 0, stock: 25, images: [U("1524592094714-0f0654e20314")], sizes: [], badge: "", is_featured: true, tags: ["watch", "minimal", "wrist"] },
  { name: "Pearl Necklace", sku: "LAC-004", description: "Premium pearl necklace designed for effortless style.", category: "accessories", brand: "Anvi", price: 1899, discount_price: 1499, discount_percent: 21, stock: 40, images: [U("1599643478518-a784e5dc4c8f")], sizes: [], badge: "New", is_featured: false, tags: ["pearl", "necklace", "jewellery"] },
  { name: "Silver Hoop Earrings", sku: "LAC-005", description: "Minimalist silver hoop earrings that add a timeless touch to any outfit.", category: "accessories", brand: "Sansa", price: 899, discount_price: 0, discount_percent: 0, stock: 70, images: [U("1611652022419-a9419f74343d")], sizes: [], badge: "New", is_featured: false, tags: ["silver", "earrings", "jewellery"] },
  { name: "Rose Gold Ring", sku: "LAC-006", description: "Delicate rose gold ring with a subtle sparkle, crafted for everyday wear.", category: "accessories", brand: "Meera", price: 1499, discount_price: 1299, discount_percent: 14, stock: 55, images: [U("1605100804763-247f67b3557e")], sizes: [], badge: "", is_featured: false, tags: ["rosegold", "ring", "jewellery"] },
  { name: "Layered Necklace", sku: "LAC-007", description: "Elegant layered necklace that brings dimension and grace to your neckline.", category: "accessories", brand: "Anvi", price: 1799, discount_price: 0, discount_percent: 0, stock: 48, images: [U("1515562141207-7a88fb7ce338")], sizes: [], badge: "Best Seller", is_featured: true, tags: ["necklace", "layered", "jewellery"] },
  { name: "Diamond Stud Earrings", sku: "LAC-008", description: "Brilliant diamond stud earrings set in fine gold for understated luxury.", category: "accessories", brand: "VogueLine", price: 2999, discount_price: 2599, discount_percent: 13, stock: 30, images: [U("1652766540048-de0a878a3266")], sizes: [], badge: "Premium", is_featured: false, tags: ["diamond", "earrings", "luxury"] },
  { name: "Classic Aviator Sunglasses", sku: "LAC-009", description: "Timeless aviator sunglasses with UV protection and a lightweight metal frame.", category: "accessories", brand: "LayaStudio", price: 1999, discount_price: 0, discount_percent: 0, stock: 40, images: [U("1612902457652-33aff0a641fa")], sizes: [], badge: "", is_featured: false, tags: ["aviator", "sunglasses", "summer"] },
  { name: "Leather Strap Watch", sku: "LAC-010", description: "Sophisticated leather strap watch with a minimalist dial and quartz movement.", category: "accessories", brand: "Zelora", price: 3499, discount_price: 2999, discount_percent: 14, stock: 25, images: [U("1549113796-66008e8d0a4f")], sizes: [], badge: "New", is_featured: true, tags: ["watch", "leather", "wrist"] },
  { name: "Gemstone Bracelet", sku: "LAC-011", description: "Hand-finished gemstone bracelet that adds a pop of color to your look.", category: "accessories", brand: "Sansa", price: 1299, discount_price: 1099, discount_percent: 15, stock: 60, images: [U("1617038220319-276d3cfab638")], sizes: [], badge: "Trending", is_featured: false, tags: ["gemstone", "bracelet", "jewellery"] },
  { name: "Pearl Drop Earrings", sku: "LAC-012", description: "Graceful pearl drop earrings that elevate both casual and festive ensembles.", category: "accessories", brand: "Meera", price: 1599, discount_price: 0, discount_percent: 0, stock: 45, images: [U("1573408301185-9146fe634ad0")], sizes: [], badge: "Best Seller", is_featured: false, tags: ["pearl", "earrings", "jewellery"] },

  // ---------- Ethnic Wear ----------
  { name: "Designer Kurti", sku: "LEW-001", description: "Premium designer kurti designed for effortless style.", category: "ethnic-wear", brand: "Zelora", price: 1799, discount_price: 0, discount_percent: 0, stock: 50, images: [U("1571587289339-cb7da03fb5a6")], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "", is_featured: true, tags: ["kurti", "designer", "ethnic"] },
  { name: "Traditional Saree", sku: "LEW-002", description: "Premium traditional saree designed for effortless style.", category: "ethnic-wear", brand: "VogueLine", price: 4999, discount_price: 4499, discount_percent: 10, stock: 18, images: [U("1678705730064-a7ecbab4b3fb")], sizes: [], badge: "Premium", is_featured: true, tags: ["saree", "traditional", "ethnic"] },
  { name: "Embroidered Salwar Set", sku: "LEW-003", description: "Premium embroidered salwar set designed for effortless style.", category: "ethnic-wear", brand: "Sansa", price: 2999, discount_price: 0, discount_percent: 0, stock: 32, images: [U("1774437891409-f4874cdd0ac4")], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "", is_featured: false, tags: ["salwar", "embroidered", "set"] },
  { name: "Festive Lehenga", sku: "LEW-004", description: "Premium festive lehenga designed for effortless style.", category: "ethnic-wear", brand: "Meera", price: 7999, discount_price: 6999, discount_percent: 13, stock: 10, images: ["https://manyavar.scene7.com/is/image/manyavar/UL5099-416-RED-101_28-10-2025-07-27?wid=1244&dpr=on,2"], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "New", is_featured: true, tags: ["lehenga", "festive", "ethnic"] },
  { name: "Banarasi Silk Saree", sku: "LEW-005", description: "Exquisite Banarasi silk saree with intricate zari work for festive celebrations.", category: "ethnic-wear", brand: "VogueLine", price: 6299, discount_price: 5599, discount_percent: 11, stock: 14, images: [U("1753981031189-27bb7bd1c079")], sizes: [], badge: "Premium", is_featured: true, tags: ["banarasi", "silk", "saree"] },
  { name: "Cotton Anarkali Suit", sku: "LEW-006", description: "Comfortable cotton Anarkali suit with elegant embroidery for daily ethnic wear.", category: "ethnic-wear", brand: "Zelora", price: 2599, discount_price: 0, discount_percent: 0, stock: 40, images: [U("1756483529840-abe0951d5884")], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "New", is_featured: false, tags: ["anarkali", "cotton", "suit"] },
  { name: "Kanjivaram Saree", sku: "LEW-007", description: "Rich Kanjivaram saree with a heavy border, a bridal and wedding favourite.", category: "ethnic-wear", brand: "Meera", price: 8999, discount_price: 7999, discount_percent: 11, stock: 8, images: [U("1717835735088-4c821959bdaa")], sizes: [], badge: "Premium", is_featured: true, tags: ["kanjivaram", "silk", "saree"] },
  { name: "Printed Palazzo Set", sku: "LEW-008", description: "Trendy printed palazzo set with a matching top for a breezy ethnic look.", category: "ethnic-wear", brand: "Anvi", price: 2199, discount_price: 1899, discount_percent: 14, stock: 36, images: [U("1767955694884-d4bf352c23c2")], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "Trending", is_featured: false, tags: ["palazzo", "printed", "set"] },
  { name: "Embroidered Lehenga", sku: "LEW-009", description: "Grand embroidered lehenga with a designer blouse for weddings and receptions.", category: "ethnic-wear", brand: "Sansa", price: 9999, discount_price: 8999, discount_percent: 10, stock: 6, images: [U("1756483510767-35245638c057")], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "New", is_featured: true, tags: ["lehenga", "embroidered", "bridal"] },
  { name: "Chanderi Kurti", sku: "LEW-010", description: "Breathable Chanderi kurti with subtle motifs, ideal for festive gatherings.", category: "ethnic-wear", brand: "LayaStudio", price: 1799, discount_price: 0, discount_percent: 0, stock: 44, images: [U("1756483527592-0b715e5bd08c")], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "", is_featured: false, tags: ["chanderi", "kurti", "ethnic"] },

  // ---------- Hand Bags ----------
  { name: "Classic Leather Tote", sku: "LHB-001", description: "Premium classic leather tote designed for effortless style.", category: "hand-bag", brand: "LayaStudio", price: 5499, discount_price: 4999, discount_percent: 9, stock: 22, images: [U("1584917865442-de89df76afd3")], sizes: [], badge: "Best Seller", is_featured: true, tags: ["leather", "tote", "bag"] },
  { name: "Premium Shoulder Bag", sku: "LHB-002", description: "Premium shoulder bag designed for effortless style.", category: "hand-bag", brand: "Anvi", price: 4599, discount_price: 0, discount_percent: 0, stock: 28, images: ["https://i5.walmartimages.com/seo/Handbags-for-Women-2025-Leather-Top-Handle-Shoulder-Satchel-Purse-Ladies-Crossbody-Tote-Work-Bags_317c7ab0-780c-4476-baf2-aceaff2b65a3.2cbbebf7c4c0b06e46f83dc08f5e7253.jpeg"], sizes: [], badge: "", is_featured: false, tags: ["shoulder", "bag", "premium"] },
  { name: "Mini Fashion Bag", sku: "LHB-003", description: "Premium mini fashion bag designed for effortless style.", category: "hand-bag", brand: "Zelora", price: 2999, discount_price: 2499, discount_percent: 17, stock: 38, images: [U("1566150905458-1bf1fc113f0d")], sizes: [], badge: "Trending", is_featured: false, tags: ["mini", "fashion", "bag"] },
  { name: "Luxury Office Handbag", sku: "LHB-004", description: "Premium luxury office handbag designed for effortless style.", category: "hand-bag", brand: "VogueLine", price: 6499, discount_price: 5999, discount_percent: 8, stock: 12, images: [U("1605733513597-a8f8341084e6")], sizes: [], badge: "", is_featured: true, tags: ["office", "handbag", "luxury"] },
  { name: "Quilted Crossbody Bag", sku: "LHB-005", description: "Compact quilted crossbody bag with an adjustable strap for hands-free styling.", category: "hand-bag", brand: "Zelora", price: 3999, discount_price: 3499, discount_percent: 13, stock: 20, images: [U("1548036328-c9fa89d128fa")], sizes: [], badge: "New", is_featured: true, tags: ["quilted", "crossbody", "bag"] },
  { name: "Suede Bucket Bag", sku: "LHB-006", description: "Soft suede bucket bag with a drawstring closure and roomy interior.", category: "hand-bag", brand: "Anvi", price: 4299, discount_price: 0, discount_percent: 0, stock: 16, images: [U("1559563458-527698bf5295")], sizes: [], badge: "Trending", is_featured: false, tags: ["suede", "bucket", "bag"] },
  { name: "Embellished Clutch", sku: "LHB-007", description: "Statement embellished clutch adorned with detailing for evening occasions.", category: "hand-bag", brand: "VogueLine", price: 2899, discount_price: 2499, discount_percent: 14, stock: 30, images: [U("1548863227-3af567fc3b27")], sizes: [], badge: "Premium", is_featured: false, tags: ["clutch", "embellished", "party"] },
  { name: "Canvas Tote Bag", sku: "LHB-008", description: "Spacious canvas tote bag perfect for daily errands and weekend getaways.", category: "hand-bag", brand: "LayaStudio", price: 1999, discount_price: 0, discount_percent: 0, stock: 50, images: [U("1553062407-98eeb64c6a62")], sizes: [], badge: "", is_featured: false, tags: ["canvas", "tote", "bag"] },
  { name: "Designer Satchel", sku: "LHB-009", description: "Structured designer satchel with premium hardware for a polished work look.", category: "hand-bag", brand: "Meera", price: 5999, discount_price: 5399, discount_percent: 10, stock: 12, images: [U("1590739225287-bd31519780c3")], sizes: [], badge: "Best Seller", is_featured: true, tags: ["satchel", "designer", "luxury"] },
  { name: "Sling Handbag", sku: "LHB-010", description: "Lightweight sling handbag with multiple compartments for everyday essentials.", category: "hand-bag", brand: "Sansa", price: 3499, discount_price: 3099, discount_percent: 11, stock: 24, images: [U("1589363358751-ab05797e5629")], sizes: [], badge: "", is_featured: false, tags: ["sling", "handbag", "bag"] },
];

const sampleCustomers = [
  { name: "Lavanya", email: "Lavanya@example.com", phone: "9876543210", total_orders: 5, total_spent: 15499, registration_date: new Date("2025-06-15") },
  { name: "Caro", email: "Caro@example.com", phone: "9876543211", total_orders: 3, total_spent: 8999, registration_date: new Date("2025-08-20") },
  { name: "Giri", email: "Giri@example.com", phone: "9876543212", total_orders: 7, total_spent: 22499, registration_date: new Date("2025-03-10") },
  { name: "Nidhi", email: "Nidhi@example.com", phone: "9876543213", total_orders: 2, total_spent: 5999, registration_date: new Date("2025-11-05") },
  { name: "Ram", email: "Ram@example.com", phone: "9876543214", total_orders: 4, total_spent: 12999, registration_date: new Date("2025-09-18") },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Admin.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});

    const admin = new Admin({
      name: "LayaStore Admin",
      email: "admin@layastore.com",
      password: "LayaStore@2026",
      role: "super_admin",
    });
    await admin.save();
    console.log("Admin created: admin@layastore.com / LayaStore@2026");

    await Product.insertMany(sampleProducts);
    console.log(`${sampleProducts.length} products seeded`);

    await Customer.insertMany(sampleCustomers);
    console.log(`${sampleCustomers.length} customers seeded`);

    console.log("\nSeed completed successfully!");
    console.log("Admin Login: admin@layastore.com / LayaStore@2026");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
