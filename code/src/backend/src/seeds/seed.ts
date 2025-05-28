import { PrismaClient, Role, CompanySize, PriceType, Status as PrismaStatus } from '@prisma/client'; // Renomeado Status para PrismaStatus para evitar conflito
import * as bcrypt from 'bcrypt';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

// Define as 12 categorias (copiado de categories.seed.ts)
const categoriesData = [
  {
    name: 'Contabilidade e Finanças',
    description: 'Serviços de contabilidade, consultoria financeira, planejamento tributário e mais.',
  },
  {
    name: 'Recursos Humanos',
    description: 'Recrutamento, seleção, gestão de folha de pagamento, treinamentos e desenvolvimento de pessoal.',
  },
  {
    name: 'Marketing e Publicidade',
    description: 'Marketing digital, design gráfico, gestão de redes sociais, SEO e publicidade online.',
  },
  {
    name: 'Tecnologia da Informação',
    description: 'Desenvolvimento de software, suporte técnico, consultoria em TI, segurança da informação e cloud computing.',
  },
  {
    name: 'Jurídico',
    description: 'Assessoria jurídica empresarial, elaboração de contratos, propriedade intelectual e direito trabalhista.',
  },
  {
    name: 'Logística e Transporte',
    description: 'Gestão de cadeia de suprimentos, transporte de cargas, armazenagem e distribuição.',
  },
  {
    name: 'Consultoria Empresarial',
    description: 'Consultoria estratégica, gestão de processos, melhoria contínua e transformação organizacional.',
  },
  {
    name: 'Treinamento e Educação',
    description: 'Cursos corporativos, workshops, capacitação profissional e programas de educação continuada.',
  },
  {
    name: 'Infraestrutura',
    description: 'Manutenção predial, gestão de espaços, serviços de limpeza e segurança patrimonial.',
  },
  {
    name: 'Saúde e Bem-estar',
    description: 'Planos de saúde corporativos, programas de qualidade de vida, medicina ocupacional e ergonomia.',
  },
  {
    name: 'Design e Criação',
    description: 'Design de produtos, branding, identidade visual, UX/UI e produção audiovisual.',
  },
  {
    name: 'Eventos Corporativos',
    description: 'Organização de eventos empresariais, convenções, conferências e team building.',
  },
];

async function main() {
  logger.info('Starting database seed...');

  // Clear existing data
  // Ordem de deleção é importante para respeitar as constraints de chave estrangeira
  logger.info('Clearing existing data...');
  await prisma.serviceReview.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.service.deleteMany();
  await prisma.refreshToken.deleteMany(); // Tokens dependem de User
  // SupplierProfile e ClientProfile dependem de User, mas são deletados em cascata se User for deletado
  // Profile depende de User, deletado em cascata
  // User será deletado por último entre os perfis
  await prisma.supplierProfile.deleteMany(); // Deletar antes de User se não houver onDelete: Cascade explícito para todas as relações
  await prisma.clientProfile.deleteMany();  // Deletar antes de User
  await prisma.profile.deleteMany();        // Deletar antes de User
  await prisma.user.deleteMany();           // Agora User
  await prisma.category.deleteMany();       // Category pode ser deletada independentemente ou antes de Service
  logger.info('Database cleared.');

  // Create admin user
  logger.info('Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@marketplace.com',
      password: adminPassword,
      role: Role.ADMIN,
      status: PrismaStatus.ACTIVE,
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
        },
      },
    },
  });
  logger.info(`Admin user created: ${admin.email}`);

  // Create sample categories (12)
  logger.info('Creating categories...');
  const createdCategories = [];
  for (const category of categoriesData) {
    const newCategory = await prisma.category.create({
      data: category,
    });
    createdCategories.push(newCategory);
  }
  logger.info(`Successfully seeded ${createdCategories.length} categories.`);

  // Create sample suppliers
  logger.info('Creating supplier users...');
  const supplierPassword = await bcrypt.hash('supplier123', 10);
  
  const supplier1 = await prisma.user.create({
    data: {
      email: 'contabil@exemplo.com',
      password: supplierPassword,
      role: Role.SUPPLIER,
      status: PrismaStatus.ACTIVE,
      profile: {
        create: {
          firstName: 'João',
          lastName: 'Contábil',
          phone: '11987654321',
        },
      },
      supplierProfile: {
        create: {
          companyName: 'Contabil Express',
          cnpj: '12345678000190',
          description: 'Serviços de contabilidade para pequenas e médias empresas.',
          website: 'https://contabilexpress.exemplo.com',
          status: PrismaStatus.ACTIVE,
        },
      },
    },
    include: { supplierProfile: true } // Incluir para pegar o ID do supplierProfile
  });
  logger.info(`Supplier 1 created: ${supplier1.email}`);

  const supplier2 = await prisma.user.create({
    data: {
      email: 'rh@exemplo.com',
      password: supplierPassword,
      role: Role.SUPPLIER,
      status: PrismaStatus.ACTIVE,
      profile: {
        create: {
          firstName: 'Maria',
          lastName: 'RH',
          phone: '11987654322',
        },
      },
      supplierProfile: {
        create: {
          companyName: 'RH Solutions',
          cnpj: '23456789000190',
          description: 'Soluções completas para gestão de recursos humanos.',
          website: 'https://rhsolutions.exemplo.com',
          status: PrismaStatus.ACTIVE,
        },
      },
    },
    include: { supplierProfile: true } // Incluir para pegar o ID do supplierProfile
  });
  logger.info(`Supplier 2 created: ${supplier2.email}`);

  // Create sample client
  logger.info('Creating client user...');
  const clientPassword = await bcrypt.hash('client123', 10);
  const client = await prisma.user.create({
    data: {
      email: 'cliente@exemplo.com',
      password: clientPassword,
      role: Role.USER,
      status: PrismaStatus.ACTIVE,
      profile: {
        create: {
          firstName: 'Carlos',
          lastName: 'Cliente',
          phone: '11987654323',
        },
      },
      clientProfile: {
        create: {
          companyName: 'Tech Solutions Ltda',
          cnpj: '34567890000190',
          segment: 'Tecnologia',
          size: CompanySize.SMALL,
        },
      },
    },
    include: { clientProfile: true } // Incluir para pegar o ID do clientProfile
  });
  logger.info(`Client user created: ${client.email}`);

  // Create sample services
  // Certifique-se que os IDs de supplier e category estão corretos
  // supplier1.supplierProfile e supplier2.supplierProfile terão os perfis se include foi usado
  // createdCategories é um array das categorias criadas
  if (supplier1.supplierProfile && supplier2.supplierProfile && createdCategories.length >= 2) {
    logger.info('Creating sample services...');
    await prisma.service.createMany({
      data: [
        {
          supplierId: supplier1.supplierProfile!.id, // Usar ! para non-null assertion
          categoryId: createdCategories[0].id, // Contabilidade e Finanças
          title: 'Contabilidade Mensal Completa',
          description: 'Serviço mensal de contabilidade completa para sua empresa.',
          price: 800.00,
          priceType: PriceType.MONTHLY,
          status: PrismaStatus.ACTIVE,
        },
        {
          supplierId: supplier1.supplierProfile!.id,
          categoryId: createdCategories[0].id, // Contabilidade e Finanças
          title: 'Declaração de Imposto de Renda PJ',
          description: 'Elaboração e entrega da declaração anual de imposto de renda para pessoa jurídica.',
          price: 1200.00,
          priceType: PriceType.FIXED,
          status: PrismaStatus.ACTIVE,
        },
        {
          supplierId: supplier2.supplierProfile!.id,
          categoryId: createdCategories[1].id, // Recursos Humanos
          title: 'Gestão de Folha de Pagamento Completa',
          description: 'Serviço mensal de processamento e gestão de folha de pagamento.',
          price: 600.00,
          priceType: PriceType.MONTHLY,
          status: PrismaStatus.ACTIVE,
        },
        {
          supplierId: supplier2.supplierProfile!.id,
          categoryId: createdCategories[1].id, // Recursos Humanos
          title: 'Recrutamento e Seleção Especializado',
          description: 'Serviço de recrutamento e seleção de profissionais qualificados para sua empresa.',
          price: 1500.00,
          priceType: PriceType.FIXED,
          status: PrismaStatus.ACTIVE,
        },
      ],
    });
    logger.info('Sample services created.');

    // Create sample contract and review if client and services exist
    if (client.clientProfile) {
      const services = await prisma.service.findMany();
      if (services.length > 0) {
        logger.info('Creating sample contract...');
        await prisma.contract.create({
          data: {
            clientId: client.clientProfile!.id,
            serviceId: services[0].id,
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
            totalPrice: services[0].price * 12, // Exemplo, ajuste conforme necessário
          },
        });
        logger.info('Sample contract created.');

        logger.info('Creating sample review...');
        await prisma.serviceReview.create({
          data: {
            clientId: client.clientProfile!.id,
            serviceId: services[0].id,
            rating: 5,
            comment: 'Excelente serviço de contabilidade, muito atenciosos e profissionais!',
          },
        });
        logger.info('Sample review created.');
      }
    }
  } else {
    logger.warn('Could not create services, contracts, or reviews due to missing supplier/client profiles or categories.');
  }

  logger.info('Database seed completed successfully');
}

main()
  .catch((e) => {
    logger.error('Error during seed:', e);
    process.exit(1); // Garantir que o setup.sh pare em caso de erro no seed
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
