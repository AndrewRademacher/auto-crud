committedPool = [];

validPool = [{
        name: 'Computer',
        dimensions: {
            width: 21.23,
            height: 0.78,
            length: 15.44,
            weight: 2.34
        },
        price: 1782.34,
        description: 'You can use it for everything.',
        salePrice: 1593.34,
        manufacturer: {
            name: 'Beefy Computer',
            website: 'www.beefy-computer.com',
            phone: '(234) 345-3563'
        }
    }, {
        name: 'Boom Box',
        dimensions: {
            width: 51.23,
            height: 24.78,
            length: 15.44,
            weight: 32.34
        },
        price: 234.34,
        description: 'Welcome to the 90s.',
        manufacturer: {
            name: 'BOOM BOOM Things',
            website: 'www.boom-boom-things.com'
        }
    }, {
        name: 'Toilet',
        dimensions: {
            width: 56.23,
            height: 86.78,
            length: 43.44,
            weight: 332.34
        },
        price: 97.34,
        description: 'You can get rid of things with it.'
    }
];

invalidPool = [{
        name: 'Computer (Invalid)',
        dimensions: {
            height: 0.78,
            weight: '2.34'
        },
        price: 1782.34,
        description: 48934,
        salePrice: 1593.34,
        manufacturer: {
            name: 'Beefy Computer',
            website: 'www.beefy-computer.com',
            phone: '(234) 345-3563',
            address: {
                line1: '234 S. Nowhere Dr.',
                city: 'Somewhereville',
                state: 'Missouri',
                zip: 25252
            }
        }
    }
];
