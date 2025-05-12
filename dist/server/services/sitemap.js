import { db } from '../db.js';
import { bicycles } from '../../shared/schema.js';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { eq } from 'drizzle-orm';
export async function generateSitemap(baseUrl) {
    try {
        // Fetch all active bicycle listings
        const activeBicycles = await db
            .select()
            .from(bicycles)
            .where(eq(bicycles.status, 'available'));
        // Create sitemap stream
        const stream = new SitemapStream({ hostname: baseUrl });
        // Add static pages with proper priorities and change frequencies
        stream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
        stream.write({ url: '/kids-bicycles', changefreq: 'daily', priority: 0.8 });
        stream.write({ url: '/premium-bicycles', changefreq: 'daily', priority: 0.8 });
        stream.write({ url: '/sell', changefreq: 'monthly', priority: 0.6 });
        stream.write({ url: '/about', changefreq: 'monthly', priority: 0.5 });
        // Add dynamic bicycle pages
        for (const bicycle of activeBicycles) {
            stream.write({
                url: `/bicycles/${bicycle.id}`,
                changefreq: 'daily',
                priority: 0.9,
                lastmod: bicycle.createdAt?.toISOString()
            });
        }
        // Add category pages
        const categories = [...new Set(activeBicycles.map(b => b.category))];
        for (const category of categories) {
            stream.write({
                url: `/category/${category.toLowerCase()}`,
                changefreq: 'daily',
                priority: 0.7
            });
        }
        stream.end();
        // Generate sitemap XML
        const data = await streamToPromise(Readable.from(stream));
        return data.toString();
    }
    catch (error) {
        console.error('Error generating sitemap:', error);
        throw error;
    }
}
