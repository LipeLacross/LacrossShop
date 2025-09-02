const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';
const API_URL = `${STRAPI_URL}/api`;

// Dados de exemplo
const stores = [
  {
    name: 'NeoMercado Principal',
    slug: 'neomercado-principal',
    domain: 'neomercado.com.br',
    description: 'Loja principal do NeoMercado',
    active: true
  }
];

const categories = [
  {
    name: 'Eletrônicos',
    slug: 'eletronicos',
    description: 'Produtos eletrônicos e tecnologia',
    featured: true
  },
  {
    name: 'Roupas',
    slug: 'roupas',
    description: 'Vestuário e acessórios',
    featured: false
  },
  {
    name: 'Casa e Jardim',
    slug: 'casa-e-jardim',
    description: 'Produtos para casa e jardim',
    featured: true
  },
  {
    name: 'Esportes',
    slug: 'esportes',
    description: 'Equipamentos e roupas esportivas',
    featured: false
  }
];

const products = [
  {
    name: 'Smartphone Galaxy S23',
    slug: 'smartphone-galaxy-s23',
    description: 'Smartphone Samsung Galaxy S23 com câmera de 50MP e tela de 6.1"',
    shortDescription: 'Smartphone Samsung Galaxy S23',
    price: 3999.99,
    stock: 15,
    featured: true,
    active: true,
    sku: 'SAMS23-001'
  },
  {
    name: 'Notebook Dell Inspiron',
    slug: 'notebook-dell-inspiron',
    description: 'Notebook Dell Inspiron com processador Intel i5 e 8GB de RAM',
    shortDescription: 'Notebook Dell Inspiron',
    price: 2999.99,
    stock: 8,
    featured: true,
    active: true,
    sku: 'DELL-INS-001'
  },
  {
    name: 'Camiseta Básica',
    slug: 'camiseta-basica',
    description: 'Camiseta básica de algodão 100% em várias cores',
    shortDescription: 'Camiseta básica de algodão',
    price: 29.99,
    stock: 50,
    featured: false,
    active: true,
    sku: 'CAM-BAS-001'
  },
  {
    name: 'Vaso Decorativo',
    slug: 'vaso-decorativo',
    description: 'Vaso decorativo para plantas com design moderno',
    shortDescription: 'Vaso decorativo moderno',
    price: 89.99,
    stock: 12,
    featured: false,
    active: true,
    sku: 'VAS-DEC-001'
  },
  {
    name: 'Bola de Futebol',
    slug: 'bola-de-futebol',
    description: 'Bola de futebol oficial tamanho 5',
    shortDescription: 'Bola de futebol oficial',
    price: 79.99,
    stock: 25,
    featured: false,
    active: true,
    sku: 'BOL-FUT-001'
  },
  {
    name: 'Fones de Ouvido Bluetooth',
    slug: 'fones-de-ouvido-bluetooth',
    description: 'Fones de ouvido sem fio com cancelamento de ruído',
    shortDescription: 'Fones Bluetooth sem fio',
    price: 199.99,
    stock: 30,
    featured: true,
    active: true,
    sku: 'FON-BLU-001'
  }
];

async function createStore() {
  try {
    console.log('Criando loja...');
    const response = await axios.post(`${API_URL}/stores`, {
      data: stores[0]
    });
    console.log('✅ Loja criada:', response.data.data.attributes.name);
    return response.data.data.id;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('already exists')) {
      console.log('ℹ️ Loja já existe, buscando ID...');
      const response = await axios.get(`${API_URL}/stores?filters[slug][$eq]=${stores[0].slug}`);
      return response.data.data[0].id;
    }
    throw error;
  }
}

async function createCategories(storeId) {
  console.log('Criando categorias...');
  const categoryIds = [];
  
  for (const category of categories) {
    try {
      const response = await axios.post(`${API_URL}/categories`, {
        data: {
          ...category,
          store: storeId
        }
      });
      categoryIds.push(response.data.data.id);
      console.log(`✅ Categoria criada: ${category.name}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('already exists')) {
        console.log(`ℹ️ Categoria já existe: ${category.name}`);
        const response = await axios.get(`${API_URL}/categories?filters[slug][$eq]=${category.slug}`);
        categoryIds.push(response.data.data[0].id);
      } else {
        throw error;
      }
    }
  }
  
  return categoryIds;
}

async function createProducts(storeId, categoryIds) {
  console.log('Criando produtos...');
  
  // Distribuir produtos pelas categorias
  const productCategories = [
    [categoryIds[0], categoryIds[1]], // Eletrônicos + Roupas
    [categoryIds[0]], // Eletrônicos
    [categoryIds[1]], // Roupas
    [categoryIds[2]], // Casa e Jardim
    [categoryIds[3]], // Esportes
    [categoryIds[0]]  // Eletrônicos
  ];
  
  for (let i = 0; i < products.length; i++) {
    try {
      const product = products[i];
      const response = await axios.post(`${API_URL}/products`, {
        data: {
          ...product,
          store: storeId,
          categories: productCategories[i]
        }
      });
      console.log(`✅ Produto criado: ${product.name}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('already exists')) {
        console.log(`ℹ️ Produto já existe: ${product.name}`);
      } else {
        throw error;
      }
    }
  }
}

async function createPages(storeId) {
  console.log('Criando páginas...');
  
  const pages = [
    {
      title: 'Sobre Nós',
      slug: 'sobre-nos',
      body: '<h2>Sobre o NeoMercado</h2><p>Somos uma plataforma de e-commerce inovadora...</p>',
      bodySummary: 'Conheça mais sobre o NeoMercado',
      featured: true
    },
    {
      title: 'Política de Privacidade',
      slug: 'politica-privacidade',
      body: '<h2>Política de Privacidade</h2><p>Esta política descreve como coletamos...</p>',
      bodySummary: 'Nossa política de privacidade',
      featured: false
    }
  ];
  
  for (const page of pages) {
    try {
      const response = await axios.post(`${API_URL}/pages`, {
        data: {
          ...page,
          store: storeId
        }
      });
      console.log(`✅ Página criada: ${page.title}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('already exists')) {
        console.log(`ℹ️ Página já existe: ${page.title}`);
      } else {
        throw error;
      }
    }
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando seed do banco de dados...');
    
    const storeId = await createStore();
    const categoryIds = await createCategories(storeId);
    await createProducts(storeId, categoryIds);
    await createPages(storeId);
    
    console.log('\n🎉 Seed concluído com sucesso!');
    console.log(`📊 Resumo:`);
    console.log(`   - 1 loja criada`);
    console.log(`   - ${categories.length} categorias criadas`);
    console.log(`   - ${products.length} produtos criados`);
    console.log(`   - 2 páginas criadas`);
    console.log('\n🌐 Acesse: http://localhost:1337/admin');
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error.message);
    if (error.response) {
      console.error('Detalhes:', error.response.data);
    }
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };
