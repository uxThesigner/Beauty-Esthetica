const PRODUCTS = [
    // --- SERVIÇOS (Tratamentos) ---
    {
        id: 'serv-limpeza',
        image: 'Imagens/Servicos/limpeza.jpg', // Lembre de criar essa pasta e por as fotos
        name: 'Limpeza de Pele Profunda 3D',
        price: 150.00,
        rating: 5.0,
        reviews: 84,
        collection: 'Facial',
        sizes: ['Sessão Única', 'Pacote 3 Sessões'], // Duração/Tipo
        material: 'Extração, Hidratação e LEDterapia',
        colors: ['Padrão', 'Com Peeling'], // Variação
        coupon: 'BEAUTY10',
        stock: 999, // Serviço "infinito"
        tags: ['facial', 'limpeza', 'acne', 'skincare', 'tratamento', 'servico']
    },
    {
        id: 'serv-massagem-relax',
        image: 'Imagens/Servicos/massagem.jpg',
        name: 'Massagem Relaxante Aromática',
        price: 120.00,
        rating: 4.9,
        reviews: 102,
        collection: 'Corporal',
        sizes: ['50 min', '80 min'], // Tempo
        material: 'Óleos Essenciais Aquecidos',
        colors: ['Lavanda', 'Capim Limão', 'Sem Aroma'], // Aroma
        coupon: 'RELAX15',
        stock: 999,
        tags: ['corporal', 'massagem', 'relaxamento', 'spa', 'servico']
    },
    {
        id: 'serv-botox',
        image: 'Imagens/Servicos/botox.jpg',
        name: 'Aplicação de Toxina Botulínica',
        price: 850.00,
        rating: 5.0,
        reviews: 45,
        collection: 'Facial',
        sizes: ['Testa + Glabela', 'Rosto Total'],
        material: 'Procedimento Médico Estético',
        colors: ['Padrão'],
        coupon: 'BEAUTY10',
        stock: 999,
        tags: ['facial', 'botox', 'rejuvenescimento', 'servico']
    },
    {
        id: 'serv-drenagem',
        image: 'Imagens/Servicos/drenagem.jpg',
        name: 'Drenagem Linfática Método Renata França',
        price: 180.00,
        rating: 4.8,
        reviews: 60,
        collection: 'Corporal',
        sizes: ['Sessão Avulsa', 'Pacote 10 Sessões'],
        material: 'Redução de edemas e medidas',
        colors: ['Corpo Todo'],
        coupon: 'DETOX20',
        stock: 999,
        tags: ['corporal', 'drenagem', 'emagrecimento', 'servico']
    },

    // --- PRODUTOS (Home Care) ---
    {
        id: 'prod-serum',
        image: 'Imagens/Produtos/serum.jpg',
        name: 'Sérum Vitamina C 10% + Ácido Ferúlico',
        price: 129.90,
        rating: 4.7,
        reviews: 30,
        collection: 'Home Care',
        sizes: ['30ml'],
        material: 'Antioxidante e Iluminador',
        colors: ['Dia/Noite'],
        coupon: 'BEAUTY10',
        stock: 15,
        tags: ['produto', 'skincare', 'rosto', 'vitamina c', 'anti-idade']
    },
    {
        id: 'prod-protetor',
        image: 'Imagens/Produtos/protetor.jpg',
        name: 'Protetor Solar FPS 70 Toque Seco',
        price: 89.90,
        rating: 4.9,
        reviews: 120,
        collection: 'Home Care',
        sizes: ['50g', '120g'],
        material: 'Alta proteção UVA/UVB',
        colors: ['Sem Cor', 'Cor Clara', 'Cor Média', 'Cor Escura'],
        coupon: 'SOL10',
        stock: 50,
        tags: ['produto', 'skincare', 'protecao', 'sol', 'rosto']
    },
    {
        id: 'prod-kit-spa',
        image: 'Imagens/Produtos/kit-spa.jpg',
        name: 'Kit Spa Day em Casa',
        price: 199.90,
        rating: 5.0,
        reviews: 18,
        collection: 'Kits',
        sizes: ['Kit Completo'],
        material: 'Velas, Sais de Banho e Hidratante',
        colors: ['Baunilha', 'Rosas'],
        coupon: 'GIFT10',
        stock: 10,
        tags: ['produto', 'kit', 'presente', 'corpo', 'banho']
    },
    {
        id: 'serv-depilacao',
        image: 'Imagens/Servicos/laser.jpg',
        name: 'Depilação a Laser - Alexandrite',
        price: 89.90,
        rating: 4.9,
        reviews: 200,
        collection: 'Depilacao',
        sizes: ['Sessão Avulsa', 'Pacote 10 Sessões'],
        material: 'Tecnologia Indolor',
        colors: ['Axila', 'Virilha', 'Pernas', 'Buço'],
        coupon: 'LISINHA',
        stock: 999,
        tags: ['servico', 'depilacao', 'laser', 'corpo', 'pele lisa']
    }
];