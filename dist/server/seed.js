import { db } from "../server/db.js";
import { users, bicycles } from "../shared/schema.js";
async function seed() {
    try {
        // First clear existing data
        await db.delete(bicycles);
        await db.delete(users);
        console.log("Cleared existing data");
        // Insert sample users
        const [user1, user2] = await db.insert(users).values([
            {
                username: "certified_seller",
                password: "password",
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
                mobile: "9876543210",
                city: "Mumbai",
                subCity: "Andheri",
                cyclingProficiency: "professional",
                type: "certified",
                businessName: null,
                businessAddress: null,
                businessPhone: null,
                businessHours: null
            },
            {
                username: "casual_seller",
                password: "password",
                firstName: "Jane",
                lastName: "Smith",
                email: "jane@example.com",
                mobile: "9876543211",
                city: "Mumbai",
                subCity: "Bandra",
                cyclingProficiency: "occasional",
                type: "individual",
                businessName: null,
                businessAddress: null,
                businessPhone: null,
                businessHours: null
            }
        ]).returning();
        console.log("Inserted sample users");
        // Insert sample bicycles with external placeholder images
        // Fixed: Pass string for price (numeric field in PostgreSQL)
        await db.insert(bicycles).values({
            sellerId: user1.id,
            category: "Adult",
            brand: "Trek",
            model: "Marlin 7",
            purchaseYear: 2023,
            price: "85000", // Convert to string for numeric type
            gearTransmission: "Multi-Speed",
            frameMaterial: "Aluminum",
            suspension: "Front",
            condition: "Like New",
            cycleType: "Mountain",
            wheelSize: "29",
            hasReceipt: true,
            additionalDetails: "Top-of-the-line mountain bike with premium components",
            images: [
                "https://via.placeholder.com/400x300.png?text=Mountain+Bike+1",
                "https://via.placeholder.com/400x300.png?text=Mountain+Bike+2"
            ],
            isPremium: true,
            status: "available",
            views: 0,
            inquiries: 0
        });
        // Add another bicycle
        await db.insert(bicycles).values({
            sellerId: user1.id,
            category: "Adult",
            brand: "Specialized",
            model: "Allez",
            purchaseYear: 2022,
            price: "95000", // Convert to string for numeric type
            gearTransmission: "Multi-Speed",
            frameMaterial: "Carbon Fiber",
            suspension: "None",
            condition: "Good",
            cycleType: "Road",
            wheelSize: "27.5",
            hasReceipt: true,
            additionalDetails: "Professional road bike, perfect for racing",
            images: [
                "https://via.placeholder.com/400x300.png?text=Road+Bike+1",
                "https://via.placeholder.com/400x300.png?text=Road+Bike+2"
            ],
            isPremium: true,
            status: "available",
            views: 0,
            inquiries: 0
        });
        // Add a bike for the second user
        await db.insert(bicycles).values({
            sellerId: user2.id,
            category: "Kids",
            brand: "Cannondale",
            model: "Quick Kids",
            purchaseYear: 2023,
            price: "35000", // Convert to string for numeric type
            gearTransmission: "Non-Geared",
            frameMaterial: "Aluminum",
            suspension: "None",
            condition: "Good",
            cycleType: "Hybrid",
            wheelSize: "20",
            hasReceipt: false,
            additionalDetails: "Perfect first bike for children",
            images: [
                "https://via.placeholder.com/400x300.png?text=Kids+Bike+1"
            ],
            isPremium: false,
            status: "available",
            views: 0,
            inquiries: 0
        });
        console.log("Seed data inserted successfully");
    }
    catch (error) {
        console.error("Error seeding database:", error);
    }
}
seed();
