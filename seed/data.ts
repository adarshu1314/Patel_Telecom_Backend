
export const admins = [
    {
        username: 'superadmin',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        email: 'admin@patel.com',
        roles: ['SUPERADMIN', 'ADMIN'],
    },
    {
        username: 'manager',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        email: 'manager@patel.com',
        roles: ['MANAGER'],
    }
];

export const customers = [
    {
        username: 'rahul_patel',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        email: 'rahul@example.com',
        mobile_number: '9876543210',
        credit_limit: 50000.00,
        remaining_credit: 45000.00,
    },
    {
        username: 'priya_sharma',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        email: 'priya@example.com',
        mobile_number: '9876543211',
        credit_limit: 20000.00,
        remaining_credit: 20000.00,
    },
    {
        username: 'amit_kumar',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        email: 'amit@example.com',
        mobile_number: '9876543212',
        credit_limit: 10000.00,
        remaining_credit: 5000.00,
    }
];

export const products = [
    {
        name: 'iPhone 15 Pro',
        description: 'Latest Apple iPhone with Titanium finish',
        price: 134900.00,
        min_stock_limit: 5,
        specifications: '256GB, Natural Titanium',
        image_url: [
            'https://example.com/iphone15pro_1.jpg',
            'https://example.com/iphone15pro_2.jpg'
        ]
    },
    {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'AI powered smartphone with S-Pen',
        price: 129999.00,
        min_stock_limit: 5,
        specifications: '512GB, Titanium Grey',
        image_url: [
            'https://example.com/s24ultra_1.jpg'
        ]
    },
    {
        name: 'OnePlus 12',
        description: 'Smooth beyond beliefs',
        price: 64999.00,
        min_stock_limit: 10,
        specifications: '16GB RAM, 512GB Storage, Flowy Emerald',
        image_url: [
            'https://example.com/op12.jpg'
        ]
    },
    {
        name: 'AirPods Pro (2nd Gen)',
        description: 'Active Noise Cancellation with USB-C',
        price: 24900.00,
        min_stock_limit: 20,
        specifications: 'USB-C Charging Case',
        image_url: [
            'https://example.com/airpods.jpg'
        ]
    },
    {
        name: 'Sony WH-1000XM5',
        description: 'Wireless Noise Cancelling Headphones',
        price: 29990.00,
        min_stock_limit: 8,
        specifications: 'Silver, 30hr Battery',
        image_url: [
            'https://example.com/sonyxm5.jpg'
        ]
    }
];
