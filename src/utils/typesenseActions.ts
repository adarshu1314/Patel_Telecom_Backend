import typesenseClient from '../config/typesense';

const PRODUCT_SCHEMA = {
    name: 'products',
    fields: [
        { name: 'product_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', optional: true },
        { name: 'category', type: 'string', optional: true, facet: true },
        { name: 'brand', type: 'string', optional: true, facet: true },
        { name: 'price', type: 'float', facet: true },
        { name: 'image_url', type: 'string[]', optional: true }
    ],
    default_sorting_field: 'price'
};

export const createProductCollection = async () => {
    try {
        const collections = await typesenseClient.collections().retrieve();
        const exists = collections.find(c => c.name === 'products');
        if (!exists) {
            await typesenseClient.collections().create(PRODUCT_SCHEMA as any); // Type assertion if needed
            console.log('Product collection created');
        } else {
            console.log('Product collection already exists');
        }
    } catch (error) {
        console.error('Error creating collection:', error);
    }
};

export const indexProduct = async (product: any) => {
    try {
        const document = {
            id: product.product_id.toString(), // TypeSense requires string ID or defaults to it
            product_id: product.product_id.toString(),
            name: product.name,
            description: product.description || '',
            category: product.category || '',
            brand: product.brand || '',
            price: parseFloat(product.price.toString()), // Decimal to float
            image_url: product.image_url || []
        };
        await typesenseClient.collections('products').documents().upsert(document);
        console.log(`Indexed product ${product.product_id}`);
    } catch (error) {
        console.error('Error indexing product:', error);
    }
};

export const searchProducts = async (query: string, filters?: any) => {
    const searchParameters = {
        q: query,
        query_by: 'name,description,brand,category',
        filter_by: filters ? filters : '', // e.g. "category:=[Electronics]"
        sort_by: 'price:asc' // Default sort
    };
    try {
        const searchResults = await typesenseClient.collections('products').documents().search(searchParameters);
        return searchResults;
    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
};
