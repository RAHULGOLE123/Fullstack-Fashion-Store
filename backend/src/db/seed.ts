
import { SQL, Placeholder } from "drizzle-orm";
import { db } from "./index";
import { categories, products } from "./schema";
import * as dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const seed = async () => {
  try {
    console.log("Seeding started...");

    
    await db.delete(products);
    await db.delete(categories);
    console.log("Existing data cleared.");

    
    const categoryData = [
  { name: "Men's Clothing", slug: "mens-clothing" },
  { name: "Women's Clothing", slug: "womens-clothing" },
  { name: "Kids' Clothing", slug: "kids-clothing" },
  { name: "Footwear", slug: "footwear" },
  { name: "Accessories", slug: "accessories" },
  { name: "Watches", slug: "watches" },
  { name: "Bags", slug: "bags" },
  { name: "Jewelry", slug: "jewelry" },
  { name: "Eyewear", slug: "eyewear" },
  { name: "Activewear", slug: "activewear" },
];

    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    console.log("Categories seeded:", insertedCategories.length);

    
    const productData: { name: string | SQL<unknown> | Placeholder<string, any>; price: string | SQL<unknown> | Placeholder<string, any>; imageUrl: string | SQL<unknown> | Placeholder<string, any>; id?: number | SQL<unknown> | Placeholder<string, any> | undefined; createdAt?: Date | SQL<unknown> | Placeholder<string, any> | null | undefined; updatedAt?: Date | SQL<unknown> | Placeholder<string, any> | null | undefined; description?: string | SQL<unknown> | Placeholder<string, any> | null | undefined; categoryId?: number | SQL<unknown> | Placeholder<string, any> | undefined; }[] | {
        name: string; description: string; price: string; // Random price
        imageUrl: string; // Unique image URL for each product
        categoryId: number;
    }[] = [];
    let productIdCounter = 1;

    insertedCategories.forEach((category) => {
      for (let i = 1; i <= 10; i++) {
        productData.push({
          name: `${category.name} Product ${i}`,
          description: `This is a high-quality ${category.name} product, perfect for your needs.`,
          price: (Math.random() * 100 + 10).toFixed(2), // Random price
          imageUrl: `https://picsum.photos/id/${productIdCounter}/400/400`, // Unique image URL for each product
          categoryId: category.id,
        });
        productIdCounter++;
      }
    });

    const insertedProducts = await db.insert(products).values(productData).returning();
    console.log("Products seeded:", insertedProducts.length);

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    process.exit(0);
  }
};

seed();