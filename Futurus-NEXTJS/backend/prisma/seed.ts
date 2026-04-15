import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('Cleaning existing markets and categories...');
  // Delete existing options and then markets
  await prisma.marketOption.deleteMany({});
  await prisma.market.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('Seeding categories...');
  const categories = [
    { id: 1, name: 'Politica', slug: 'politica' },
    { id: 2, name: 'Games', slug: 'games' },
    { id: 3, name: 'Crypto', slug: 'crypto' },
    { id: 4, name: 'Tecnologia', slug: 'tecnologia' },
    { id: 5, name: 'Mundo', slug: 'mundo' },
    { id: 6, name: 'Esportes', slug: 'esportes' },
    { id: 7, name: 'Futebol', slug: 'futebol' },
    { id: 8, name: 'Clima', slug: 'clima' },
    { id: 9, name: 'Saúde', slug: 'saude' },
    { id: 10, name: 'Espaço', slug: 'espaco' },
    { id: 11, name: 'Educação', slug: 'educacao' },
    { id: 12, name: 'Ciência', slug: 'ciencia' },
    { id: 13, name: 'Cultura', slug: 'cultura' },
    { id: 14, name: 'Eleições', slug: 'eleicoes' },
  ];

  for (const cat of categories) {
    await prisma.category.create({
      data: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        status: 1,
      },
    });
  }

  console.log('Seeding initial markets...');
  const marketsData = [
    { id: 1, catId: 1, question: 'Lula Vence Eleições Presidências 2026', slug: 'lula', image: '/uploads/markets/699727f35bcd51771513843.png', description: 'Lula sera eleito para Presidencia em 2026', start: '2026-02-19T12:02:00', end: '2026-11-01T12:02:00', vol: 2000000, yesShare: 50, noShare: 50 },
    { id: 2, catId: 8, question: '2026 será o ano mais quente já registrado?', slug: 'calor', image: 'https://images.unsplash.com/photo-1502318217862-aa4e294ba657?q=80&w=2832&auto=format&fit=crop', description: 'A temperatura média global de 2026 superará todos os recordes anteriores?', start: '2026-02-20T19:14:00', end: '2026-03-31T19:14:00', vol: 400000, yesShare: 50, noShare: 50 },
    { id: 3, catId: 3, question: 'Bitcoin ultrapassará $100.000 em 2026?', slug: 'bitcoin', image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=2832&auto=format&fit=crop', description: 'O Bitcoin atingirá o preço de $100.000 USD até 31 de dezembro de 2026?', start: '2026-02-20T19:17:00', end: '2027-01-01T19:17:00', vol: 900000, yesShare: 50, noShare: 50 },
    { id: 4, catId: 7, question: 'Flamengo será Campeão Brasileiro 2026?', slug: 'flamengo18', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2832&auto=format&fit=crop', description: 'O Flamengo vencerá o Campeonato Brasileiro de 2026.', start: '2026-02-20T19:19:00', end: '2026-08-31T19:19:00', vol: 360000, yesShare: 50, noShare: 50 },
    { id: 5, catId: 4, question: 'IA substituirá 30% dos trabalhos até 2026?', slug: 'inteligencia-artificial', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2832&auto=format&fit=crop', description: 'A Inteligência Artificial substituirá 30% ou mais dos empregos atuais até o final de 2026?', start: '2026-02-20T19:28:00', end: '2026-12-31T19:28:00', vol: 840000, yesShare: 50, noShare: 50 },
    { id: 6, catId: 5, question: 'Haverá acordo de paz formal ou cessar-fogo na Ucrânia até meados de 2026?', slug: 'ucrania', image: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=2832&auto=format&fit=crop', description: 'Haverá um acordo de paz formal ou cessar-fogo duradouro até meados de 2026?', start: '2026-02-20T19:29:00', end: '2027-01-01T19:29:00', vol: 700000, yesShare: 50, noShare: 50 },
    { id: 7, catId: 12, question: 'Vacina universal contra o câncer aprovada em 2026?', slug: 'vacina', image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2832&auto=format&fit=crop', description: 'Uma vacina universal contra o câncer será aprovada pelo FDA ou EMA até o final de 2026?', start: '2026-02-20T19:32:00', end: '2027-01-01T19:32:00', vol: 300000, yesShare: 50, noShare: 50 },
    { id: 8, catId: 6, question: 'O Brasil vencerá a Copa do Mundo 2026?', slug: 'copa', image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2832&auto=format&fit=crop', description: 'A seleção brasileira de futebol vencerá a Copa FIFA 2026.', start: '2026-02-20T19:33:00', end: '2026-08-31T19:33:00', vol: 800000, yesShare: 50, noShare: 50 },
  ];

  for (const m of marketsData) {
    const market = await prisma.market.create({
      data: {
        id: m.id,
        categoryId: m.catId,
        question: m.question,
        slug: m.slug,
        status: 1,
        description: m.description,
        image: m.image,
        startDate: m.start ? new Date(m.start) : null,
        endDate: m.end ? new Date(m.end) : null,
        yesShare: m.yesShare,
        noShare: m.noShare,
        volume: m.vol,
      },
    });

    await prisma.marketOption.create({
      data: {
        id: market.id,
        marketId: market.id,
        question: m.question,
        initialYesPool: 1000,
        initialNoPool: 1000,
        yesPool: 1000,
        noPool: 1000,
        commission: 5.0,
        status: 1,
      },
    });
  }

  console.log('Seeding admin user...');
  const hashedAdminPassword = await bcrypt.hash('admin123', 12);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: { password: hashedAdminPassword },
    create: {
      username: 'admin',
      password: hashedAdminPassword,
      name: 'Super Admin',
      email: 'admin@futurus.com',
    },
  });

  console.log('Seeding initial blog posts...');
  await prisma.blog.deleteMany({});

  const blogPosts = [
    {
      title: 'Bem-vindo ao Futurus: O Futuro das Previsões',
      slug: 'bem-vindo-ao-futurus',
      description: 'Apresentamos a plataforma revolucionária de mercados de previsão que está mudando a forma como antecipamos o futuro.',
      content: `
# O Início de Uma Nova Era

O **Futurus** nasceu de uma visão simples, mas poderosa: democratizar o acesso à inteligência coletiva e transformar previsões em oportunidades reais.

## O Que São Mercados de Previsão?

Mercados de previsão são plataformas onde você pode expressar suas opiniões sobre eventos futuros de forma tangível. Diferente de apostas tradicionais, nossos mercados são baseados em análise, pesquisa e a sabedoria coletiva de milhares de participantes.

## Por Que Escolher o Futurus?

### 🎯 Mercados Diversificados
Desde política brasileira até criptomoedas, esportes mundiais e avanços tecnológicos - temos mercados para todos os interesses.

### 💎 Tecnologia de Ponta
Construído com as mais modernas tecnologias, garantimos uma experiência fluida, segura e transparente.

### 🌍 Comunidade Global
Junte-se a milhares de analistas, entusiastas e visionários que estão moldando o futuro das previsões.

### 🔒 Segurança Total
Seus dados e fundos são protegidos com criptografia de nível bancário e verificação em múltiplas camadas.

## Como Começar?

1. **Crie sua conta** em menos de 2 minutos
2. **Explore os mercados** disponíveis
3. **Faça suas previsões** com base em sua análise
4. **Acompanhe seus resultados** em tempo real

## O Futuro é Agora

No Futurus, acreditamos que todos têm insights valiosos sobre o futuro. Nossa plataforma transforma essa sabedoria coletiva em uma ferramenta poderosa de análise e previsão.

**Junte-se a nós e seja parte da revolução das previsões!**

---

*Equipe Futurus*
      `,
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop',
      category: 'Novidades',
      author: 'Equipe Futurus',
      status: 1,
    },
    {
      title: 'Como Funcionam os Mercados de Previsão',
      slug: 'como-funcionam-mercados-previsao',
      description: 'Guia completo para entender e dominar os mercados de previsão no Futurus.',
      content: `
# Entendendo os Mercados de Previsão

Os mercados de previsão representam uma das formas mais fascinantes de agregar conhecimento coletivo e transformá-lo em probabilidades precisas sobre eventos futuros.

## O Conceito Básico

Cada mercado no Futurus é baseado em uma pergunta simples com duas opções:
- **SIM**: Você acredita que o evento vai acontecer
- **NÃO**: Você acredita que o evento não vai acontecer

## Como os Preços Funcionam

Os preços das opções variam de R$0,01 a R$0,99, refletindo a probabilidade percebida do evento:
- Um preço de **R$0,70** para SIM indica ~70% de chance do evento ocorrer
- O preço de NÃO seria automaticamente **R$0,30**

## Ganhos e Resultados

Quando o mercado fecha e o resultado é declarado:
- Se você acertou, cada ação vale **R$1,00**
- Se você errou, cada ação vale **R$0,00**

### Exemplo Prático

Se você comprar 100 ações de SIM por R$0,40 cada:
- **Investimento**: R$40,00
- **Se SIM vencer**: Você recebe R$100,00 (lucro de R$60,00)
- **Se NÃO vencer**: Você perde R$40,00

## Estratégias de Sucesso

1. **Pesquise antes de investir** - Analise dados, tendências e opiniões de especialistas
2. **Diversifique** - Não coloque todos os ovos na mesma cesta
3. **Acompanhe os mercados** - Preços mudam conforme novas informações surgem
4. **Aprenda com a comunidade** - Comentários e discussões são fontes valiosas

## Conclusão

Os mercados de previsão são uma forma inteligente de monetizar seu conhecimento e participar de discussões importantes sobre o futuro.

**Comece agora e descubra o poder da inteligência coletiva!**
      `,
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2940&auto=format&fit=crop',
      category: 'Educação',
      author: 'Equipe Futurus',
      status: 1,
    },
  ];

  for (const blog of blogPosts) {
    await prisma.blog.create({
      data: blog,
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
