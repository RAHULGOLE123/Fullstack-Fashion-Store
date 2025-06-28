// src/index.ts
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { db } from './db';
import { categories, products, cartItems } from './db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod'; // Assuming you are using zod for validation
import asyncHandler from 'express-async-handler'; // <-- Ye line add karein

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // For parsing application/json

// Health check endpoint
app.get("/", asyncHandler(async (req, res) => { // Wrap your handler with asyncHandler
    res.send("Hello from Backend!");
}));

// Example product endpoints
// Get all products
app.get("/api/products", asyncHandler(async (req, res) => { // Wrap here
    const allProducts = await db.select().from(products);
    res.json(allProducts);
}));

// Get product by ID
app.get("/api/products/:id", asyncHandler(async (req, res) => { // Wrap here
    const productId = parseInt(req.params.id);
    const product = await db.select().from(products).where(eq(products.id, productId));
    if (product.length > 0) {
        res.json(product[0]);
    } else {
        res.status(404).send("Product not found");
    }
}));

// Create a new product (Add validation schema if not already there)
const createProductSchema = z.object({
    title: z.string().min(1), // Use 'title' as per your schema change
    description: z.string().optional(),
    price: z.number().positive(), // <-- Yahan price ko number rakha hai
    imageUrl: z.string().url(),
    categoryId: z.number().int().positive(),
});

app.post("/api/products", asyncHandler(async (req, res) => { // Wrap here
    try {
        const validatedData = createProductSchema.parse(req.body);
        // Drizzle expects 'price' as numeric, jo SQL mein string-like hota hai.
        // Yahan hum price ko string mein convert kar sakte hain agar numeric('price') string expect karta hai.
        // ya to schema mein numeric('price') ko number rakhein.
        // Agar aapke schema mein numeric('price') hai to 'number' hi use karen.
        const newProduct = await db.insert(products).values({
            name: validatedData.title,
            description: validatedData.description,
            price: validatedData.price.toString(), // agar Drizzle numeric ko string expect karta hai
            imageUrl: validatedData.imageUrl,
            categoryId: validatedData.categoryId
        }).returning();
        res.status(201).json(newProduct[0]);
    } catch (error) {
        console.error("Validation or DB error:", error);
        let errorMessage = "Unknown error";
        let errorIssues = undefined;
        if (typeof error === "object" && error !== null) {
            if ("issues" in error) {
                // @ts-ignore
                errorIssues = (error as any).issues;
            }
            if ("message" in error) {
                // @ts-ignore
                errorMessage = (error as any).message;
            }
        }
        res.status(400).json({ message: "Invalid product data", error: errorIssues || errorMessage });
    }
}));

// Update product (Add validation schema if not already there)
const updateProductSchema = createProductSchema.partial(); // Allows partial updates

app.put("/api/products/:id", asyncHandler(async (req, res) => { // Wrap here
    const productId = parseInt(req.params.id);
    try {
        const validatedData = updateProductSchema.parse(req.body);

        // Price ko string mein convert karein agar numeric field string expect karta hai Drizzle mein
        const updateData: any = { ...validatedData };
        if (updateData.price !== undefined) {
            updateData.price = updateData.price.toString();
        }

        const updatedProducts = await db.update(products)
            .set(updateData) // <-- Yahan bhi type mismatch ho sakta hai.
            .where(eq(products.id, productId))
            .returning();
        if (updatedProducts.length > 0) {
            res.json(updatedProducts[0]);
        } else {
            res.status(404).send("Product not found");
        }
    } catch (error) {
        console.error("Validation or DB error:", error);
        let errorMessage = "Unknown error";
        let errorIssues = undefined;
        if (typeof error === "object" && error !== null) {
            if ("issues" in error) {
                // @ts-ignore
                errorIssues = (error as any).issues;
            }
            if ("message" in error) {
                // @ts-ignore
                errorMessage = (error as any).message;
            }
        }
        res.status(400).json({ message: "Invalid product data", error: errorIssues || errorMessage });
    }
}));

// Delete product
app.delete("/api/products/:id", asyncHandler(async (req, res) => { // Wrap here
    const productId = parseInt(req.params.id);
    const deletedProducts = await db.delete(products)
        .where(eq(products.id, productId))
        .returning();
    if (deletedProducts.length > 0) {
        res.status(204).send(); // No Content
    } else {
        res.status(404).send("Product not found");
    }
}));

// Category Endpoints
// Get all categories
app.get("/api/categories", asyncHandler(async (req, res) => {
    const allCategories = await db.select().from(categories);
    res.json(allCategories);
}));

// Create a new category
const createCategorySchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1), // <-- Agar slug required hai schema mein
});

app.post("/api/categories", asyncHandler(async (req, res) => { // Wrap here
    try {
        const validatedData = createCategorySchema.parse(req.body);
        const newCategory = await db.insert(categories).values(validatedData).returning();
        res.status(201).json(newCategory[0]);
    } catch (error) {
        console.error("Validation or DB error:", error);
        let errorMessage = "Unknown error";
        let errorIssues = undefined;
        if (typeof error === "object" && error !== null) {
            if ("issues" in error) {
                // @ts-ignore
                errorIssues = (error as any).issues;
            }
            if ("message" in error) {
                // @ts-ignore
                errorMessage = (error as any).message;
            }
        }
        res.status(400).json({ message: "Invalid category data", error: errorIssues || errorMessage });
    }
}));


// Cart Endpoints
// Add item to cart
const addToCartSchema = z.object({
    userId: z.string().min(1),
    productId: z.number().int().positive(),
    quantity: z.number().int().positive().default(1),
});

app.post("/api/cart", asyncHandler(async (req, res) => { // Wrap here
    try {
        const validatedData = addToCartSchema.parse(req.body);
        const { userId, productId, quantity } = validatedData;

        let updatedCartItem;
        // Check if item already exists for the user
        const existingCartItem = await db.select()
            .from(cartItems)
            .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));

        if (existingCartItem.length > 0) {
            // Update quantity
            updatedCartItem = await db.update(cartItems)
                .set({ quantity: existingCartItem[0].quantity + quantity })
                .where(eq(cartItems.id, existingCartItem[0].id))
                .returning();
        } else {
            // Insert new item
            updatedCartItem = await db.insert(cartItems).values({
                ...validatedData,
                quantity: validatedData.quantity.toString()
            }).returning(); // <-- Yahan quantity ab string hai.
        }

        res.status(201).json(updatedCartItem[0]);
    } catch (error) {
        console.error("Validation or DB error:", error);
        let errorMessage = "Unknown error";
        let errorIssues = undefined;
        if (typeof error === "object" && error !== null) {
            if ("issues" in error) {
                // @ts-ignore
                errorIssues = (error as any).issues;
            }
            if ("message" in error) {
                // @ts-ignore
                errorMessage = (error as any).message;
            }
        }
        res.status(400).json({ message: "Invalid cart data", error: errorIssues || errorMessage });
    }
}));

// Remove item from cart
app.delete("/api/cart/:userId/:productId", asyncHandler(async (req, res) => { // Wrap here
    const { userId, productId } = req.params;

    const deletedItems = await db.delete(cartItems)
        .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, parseInt(productId))))
        .returning();

    if (deletedItems.length > 0) {
        res.status(204).send();
    } else {
        res.status(404).send("Cart item not found");
    }
}));


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});