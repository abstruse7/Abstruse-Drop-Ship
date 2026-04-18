require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.account.deleteMany();
  await prisma.distributor.deleteMany();
  await prisma.user.deleteMany();

  // Create owner account
  const ownerEmail = process.env.OWNER_EMAIL || "andreagrisham7@gmail.com";
  const ownerRawPassword = process.env.OWNER_PASSWORD;
  if (!ownerRawPassword) {
    console.error("OWNER_PASSWORD must be set in .env");
    process.exit(1);
  }
  const ownerPassword = await bcrypt.hash(ownerRawPassword, 12);
  const owner = await prisma.user.create({
    data: {
      email: ownerEmail,
      password: ownerPassword,
      name: "Andrea",
      role: "OWNER",
    },
  });
  console.log("Created owner:", owner.email);

  // Create distributor user
  const distPassword = await bcrypt.hash("distributor123", 10);
  const distUser = await prisma.user.create({
    data: {
      email: "distributor@example.com",
      password: distPassword,
      name: "John Smith",
      role: "DISTRIBUTOR",
    },
  });

  const distributor = await prisma.distributor.create({
    data: {
      companyName: "US Supply Co",
      contactName: "John Smith",
      contactEmail: "distributor@example.com",
      phone: "555-123-4567",
      website: "https://ussupplyco.com",
      description:
        "Leading US distributor of electronics and home goods with nationwide shipping.",
      isApproved: true,
      userId: distUser.id,
    },
  });
  console.log("Created distributor:", distributor.companyName);

  // Create buyer user
  const buyerPassword = await bcrypt.hash("buyer123", 10);
  const buyer = await prisma.user.create({
    data: {
      email: "buyer@example.com",
      password: buyerPassword,
      name: "Jane Doe",
      role: "BUYER",
    },
  });
  console.log("Created buyer:", buyer.email);

  // Create categories
  const categories = await Promise.all(
    [
      { name: "Electronics", slug: "electronics" },
      { name: "Home & Garden", slug: "home-garden" },
      { name: "Sports & Outdoors", slug: "sports-outdoors" },
      { name: "Health & Beauty", slug: "health-beauty" },
      { name: "Clothing & Accessories", slug: "clothing-accessories" },
      { name: "Toys & Games", slug: "toys-games" },
    ].map((cat) => prisma.category.create({ data: cat }))
  );
  console.log("Created", categories.length, "categories");

  // Create products
  const products = [
    {
      name: "Wireless Bluetooth Earbuds",
      slug: "wireless-bluetooth-earbuds",
      description:
        "High-quality wireless earbuds with noise cancellation, 24-hour battery life, and crystal-clear sound. IPX5 water resistant.",
      price: 49.99,
      costPrice: 22.0,
      sku: "ELEC-001",
      stock: 500,
      weight: 0.15,
      categoryId: categories[0].id,
    },
    {
      name: "Smart Watch Fitness Tracker",
      slug: "smart-watch-fitness-tracker",
      description:
        "Track your steps, heart rate, sleep, and more. 7-day battery life with always-on display. Compatible with iOS and Android.",
      price: 79.99,
      costPrice: 35.0,
      sku: "ELEC-002",
      stock: 300,
      weight: 0.2,
      categoryId: categories[0].id,
    },
    {
      name: "Portable Phone Charger 20000mAh",
      slug: "portable-phone-charger-20000mah",
      description:
        "Fast-charging power bank with dual USB-C ports. Charges most phones 4-5 times. LED battery indicator.",
      price: 34.99,
      costPrice: 15.0,
      sku: "ELEC-003",
      stock: 800,
      weight: 0.4,
      categoryId: categories[0].id,
    },
    {
      name: "LED Desk Lamp with USB Port",
      slug: "led-desk-lamp-usb",
      description:
        "Adjustable LED desk lamp with 5 brightness levels, 3 color temperatures, and built-in USB charging port.",
      price: 29.99,
      costPrice: 12.0,
      sku: "HOME-001",
      stock: 400,
      weight: 1.2,
      categoryId: categories[1].id,
    },
    {
      name: "Stainless Steel Water Bottle",
      slug: "stainless-steel-water-bottle",
      description:
        "Double-wall vacuum insulated 32oz water bottle. Keeps drinks cold 24 hours or hot 12 hours. BPA-free.",
      price: 24.99,
      costPrice: 8.0,
      sku: "HOME-002",
      stock: 600,
      weight: 0.5,
      categoryId: categories[1].id,
    },
    {
      name: "Yoga Mat Premium Non-Slip",
      slug: "yoga-mat-premium-non-slip",
      description:
        "Extra thick 6mm yoga mat with alignment lines. Non-slip surface on both sides. Includes carrying strap.",
      price: 39.99,
      costPrice: 16.0,
      sku: "SPORT-001",
      stock: 350,
      weight: 1.8,
      categoryId: categories[2].id,
    },
    {
      name: "Resistance Bands Set",
      slug: "resistance-bands-set",
      description:
        "5-piece resistance band set with different tension levels. Perfect for home workouts, physical therapy, and stretching.",
      price: 19.99,
      costPrice: 6.0,
      sku: "SPORT-002",
      stock: 700,
      weight: 0.4,
      categoryId: categories[2].id,
    },
    {
      name: "Vitamin C Serum for Face",
      slug: "vitamin-c-serum-face",
      description:
        "Anti-aging face serum with 20% Vitamin C, Hyaluronic Acid, and Vitamin E. Brightens and firms skin.",
      price: 18.99,
      costPrice: 5.0,
      sku: "HEALTH-001",
      stock: 450,
      weight: 0.1,
      categoryId: categories[3].id,
    },
    {
      name: "Bamboo Sunglasses Polarized",
      slug: "bamboo-sunglasses-polarized",
      description:
        "Eco-friendly bamboo frame sunglasses with polarized UV400 lenses. Lightweight and durable with a natural look.",
      price: 27.99,
      costPrice: 9.0,
      sku: "CLOTH-001",
      stock: 250,
      weight: 0.1,
      categoryId: categories[4].id,
    },
    {
      name: "Building Blocks 500 Piece Set",
      slug: "building-blocks-500-piece-set",
      description:
        "Compatible with major brands. 500 pieces in assorted colors and shapes. Perfect for ages 4+. Comes in storage container.",
      price: 29.99,
      costPrice: 11.0,
      sku: "TOYS-001",
      stock: 200,
      weight: 2.0,
      categoryId: categories[5].id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        distributorId: distributor.id,
      },
    });
  }
  console.log("Created", products.length, "products");

  // Create a sample address for the buyer
  await prisma.address.create({
    data: {
      label: "Home",
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "US",
      userId: buyer.id,
    },
  });
  console.log("Created sample address");

  console.log("\nSeed complete!");
  console.log("---");
  console.log("Owner login:       " + ownerEmail + " / (see .env OWNER_PASSWORD)");
  console.log("Distributor login:  distributor@example.com / distributor123");
  console.log("Buyer login:        buyer@example.com / buyer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
