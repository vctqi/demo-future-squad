import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

// Define our default categories
const categories = [
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

/**
 * Seed categories in the database
 */
export async function seedCategories() {
  logger.info('Seeding categories...');
  
  try {
    // Check if categories already exist
    const existingCategoriesCount = await prisma.category.count();
    
    if (existingCategoriesCount > 0) {
      logger.info(`Categories already exist (${existingCategoriesCount}). Skipping seed.`);
      return;
    }
    
    // Insert categories
    for (const category of categories) {
      await prisma.category.create({
        data: category,
      });
    }
    
    logger.info(`Successfully seeded ${categories.length} categories.`);
  } catch (error) {
    logger.error('Error seeding categories:', error);
    throw error;
  }
}

// Run seed if this script is called directly
if (require.main === module) {
  seedCategories()
    .catch((error) => {
      logger.error('Error running seed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}