
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Brand } from '../lib/models';
import dbConnect from '../lib/db';

const brands = [
    {
        name: "Zara",
        description: "Zara is one of the largest international fashion companies. It belongs to Inditex, one of the world's largest distribution groups.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zara_Logo.svg/1200px-Zara_Logo.svg.png"
    },
    {
        name: "H&M",
        description: "H&M offers fashion and quality at the best price in a sustainable way.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/1200px-H%26M-Logo.svg.png"
    },
    {
        name: "Gucci",
        description: "Influential, innovative and progressive, Gucci is reinventing a wholly modern approach to fashion.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/1960s_Gucci_Logo.svg/1200px-1960s_Gucci_Logo.svg.png"
    },
    {
        name: "Nike",
        description: "Nike, Inc. is an American multinational corporation that is engaged in the design, development, manufacturing, and worldwide marketing and sales of footwear, apparel, equipment, accessories, and services.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png"
    },
    {
        name: "Aari",
        description: "Premium ethnic wear for women.",
        image: "" // Keeping existing if matches, or updating
    }
];

async function seedBrands() {
    try {
        console.log('Connecting to database...');
        await dbConnect();
        console.log('Connected!');

        for (const brandData of brands) {
            const id = brandData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

            const existing = await Brand.findOne({ id });
            if (existing) {
                console.log(`Brand ${brandData.name} already exists. Updating...`);
                existing.description = brandData.description;
                if (brandData.image) existing.image = brandData.image;
                await existing.save();
            } else {
                console.log(`Creating brand ${brandData.name}...`);
                await Brand.create({
                    id,
                    ...brandData
                });
            }
        }

        console.log('Brand seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding brands:', error);
        process.exit(1);
    }
}

seedBrands();
