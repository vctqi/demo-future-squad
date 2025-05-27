import { PrismaClient, Role, CompanySize, PriceType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.serviceReview.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.supplierProfile.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database cleared');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@marketplace.com',
      password: adminPassword,
      role: Role.ADMIN,
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
        },
      },
    },
  });

  console.log('Admin user created:', admin.id);

  // Create sample categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Contabilidade',
        description: 'Serviços de contabilidade para empresas',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Recursos Humanos',
        description: 'Serviços de recursos humanos e gestão de pessoas',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Marketing',
        description: 'Serviços de marketing digital e tradicional',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Consultoria Financeira',
        description: 'Serviços de consultoria financeira e planejamento',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Consultoria Jurídica',
        description: 'Serviços jurídicos para empresas',
      },
    }),
  ]);

  console.log('Categories created:', categories.length);

  // Create sample suppliers
  const supplierPassword = await bcrypt.hash('supplier123', 10);
  
  const supplier1 = await prisma.user.create({
    data: {
      email: 'contabil@exemplo.com',
      password: supplierPassword,
      role: Role.SUPPLIER,
      profile: {
        create: {
          firstName: 'João',
          lastName: 'Silva',
          phone: '11987654321',
        },
      },
      supplierProfile: {
        create: {
          companyName: 'Contabil Express',
          cnpj: '12345678000190',
          description: 'Serviços de contabilidade para pequenas e médias empresas',
          website: 'https://contabilexpress.exemplo.com',
          status: 'ACTIVE',
        },
      },
    },
  });

  const supplier2 = await prisma.user.create({
    data: {
      email: 'rh@exemplo.com',
      password: supplierPassword,
      role: Role.SUPPLIER,
      profile: {
        create: {
          firstName: 'Maria',
          lastName: 'Santos',
          phone: '11987654322',
        },
      },
      supplierProfile: {
        create: {
          companyName: 'RH Solutions',
          cnpj: '23456789000190',
          description: 'Soluções completas para gestão de recursos humanos',
          website: 'https://rhsolutions.exemplo.com',
          status: 'ACTIVE',
        },
      },
    },
  });

  console.log('Suppliers created:', [supplier1.id, supplier2.id]);

  // Create sample client
  const clientPassword = await bcrypt.hash('client123', 10);
  
  const client = await prisma.user.create({
    data: {
      email: 'cliente@exemplo.com',
      password: clientPassword,
      role: Role.USER,
      profile: {
        create: {
          firstName: 'Carlos',
          lastName: 'Oliveira',
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
  });

  console.log('Client created:', client.id);

  // Get supplier profiles
  const supplierProfiles = await prisma.supplierProfile.findMany();

  // Create sample services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        supplierId: supplierProfiles[0].id,
        categoryId: categories[0].id,
        title: 'Contabilidade Mensal',
        description: 'Serviço mensal de contabilidade completa para empresas',
        price: 800.00,
        priceType: PriceType.MONTHLY,
        status: 'ACTIVE',
      },
    }),
    prisma.service.create({
      data: {
        supplierId: supplierProfiles[0].id,
        categoryId: categories[0].id,
        title: 'Declaração de Imposto de Renda PJ',
        description: 'Serviço de declaração anual de imposto de renda para empresas',
        price: 1200.00,
        priceType: PriceType.FIXED,
        status: 'ACTIVE',
      },
    }),
    prisma.service.create({
      data: {
        supplierId: supplierProfiles[1].id,
        categoryId: categories[1].id,
        title: 'Gestão de Folha de Pagamento',
        description: 'Serviço mensal de gestão de folha de pagamento',
        price: 600.00,
        priceType: PriceType.MONTHLY,
        status: 'ACTIVE',
      },
    }),
    prisma.service.create({
      data: {
        supplierId: supplierProfiles[1].id,
        categoryId: categories[1].id,
        title: 'Recrutamento e Seleção',
        description: 'Serviço de recrutamento e seleção de profissionais',
        price: 1500.00,
        priceType: PriceType.FIXED,
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log('Services created:', services.length);

  // Get client profile
  const clientProfile = await prisma.clientProfile.findFirst({
    where: { userId: client.id },
  });

  if (clientProfile) {
    // Create sample contract
    const contract = await prisma.contract.create({
      data: {
        clientId: clientProfile.id,
        serviceId: services[0].id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
        totalPrice: 9600.00, // 12 * 800
      },
    });

    console.log('Contract created:', contract.id);

    // Create sample review
    const review = await prisma.serviceReview.create({
      data: {
        clientId: clientProfile.id,
        serviceId: services[0].id,
        rating: 5,
        comment: 'Excelente serviço, recomendo!',
      },
    });

    console.log('Review created:', review.id);
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });