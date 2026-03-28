import { PrismaClient, TransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salary', color: '#10b981', icon: 'briefcase' },
  { name: 'Freelance', color: '#3b82f6', icon: 'laptop' },
  { name: 'Investment', color: '#8b5cf6', icon: 'trending-up' },
  { name: 'Business', color: '#f59e0b', icon: 'building' },
  { name: 'Other Income', color: '#6b7280', icon: 'plus-circle' },
];

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Housing', color: '#ef4444', icon: 'home' },
  { name: 'Food & Dining', color: '#f97316', icon: 'utensils' },
  { name: 'Transportation', color: '#eab308', icon: 'car' },
  { name: 'Healthcare', color: '#ec4899', icon: 'heart-pulse' },
  { name: 'Shopping', color: '#8b5cf6', icon: 'shopping-bag' },
  { name: 'Entertainment', color: '#06b6d4', icon: 'tv' },
  { name: 'Education', color: '#3b82f6', icon: 'book-open' },
  { name: 'Utilities', color: '#14b8a6', icon: 'zap' },
  { name: 'Personal Care', color: '#f43f5e', icon: 'smile' },
  { name: 'Other Expense', color: '#6b7280', icon: 'more-horizontal' },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123456', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@financetracker.app' },
    update: {},
    create: {
      email: 'demo@financetracker.app',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Create income categories
  const incomeCategories = await Promise.all(
    DEFAULT_INCOME_CATEGORIES.map((cat) =>
      prisma.category.upsert({
        where: { name_userId: { name: cat.name, userId: user.id } },
        update: {},
        create: { ...cat, type: TransactionType.INCOME, isDefault: true, userId: user.id },
      })
    )
  );

  // Create expense categories
  const expenseCategories = await Promise.all(
    DEFAULT_EXPENSE_CATEGORIES.map((cat) =>
      prisma.category.upsert({
        where: { name_userId: { name: cat.name, userId: user.id } },
        update: {},
        create: { ...cat, type: TransactionType.EXPENSE, isDefault: true, userId: user.id },
      })
    )
  );

  console.log(`✅ Created ${incomeCategories.length + expenseCategories.length} categories`);

  // Create sample transactions for the last 6 months
  const now = new Date();
  const transactions = [];

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const month = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);

    // Income transactions
    transactions.push({
      amount: 5000 + Math.random() * 500,
      type: TransactionType.INCOME,
      description: 'Monthly Salary',
      date: new Date(month.getFullYear(), month.getMonth(), 1),
      userId: user.id,
      categoryId: incomeCategories[0].id,
    });

    if (Math.random() > 0.4) {
      transactions.push({
        amount: 500 + Math.random() * 1500,
        type: TransactionType.INCOME,
        description: 'Freelance Project',
        date: new Date(month.getFullYear(), month.getMonth(), Math.floor(Math.random() * 28) + 1),
        userId: user.id,
        categoryId: incomeCategories[1].id,
      });
    }

    // Expense transactions
    const expenseData = [
      { desc: 'Monthly Rent', amount: 1500, catIdx: 0 },
      { desc: 'Grocery Shopping', amount: 200 + Math.random() * 150, catIdx: 1 },
      { desc: 'Restaurant Dinner', amount: 50 + Math.random() * 80, catIdx: 1 },
      { desc: 'Gas', amount: 60 + Math.random() * 40, catIdx: 2 },
      { desc: 'Electricity Bill', amount: 80 + Math.random() * 50, catIdx: 7 },
      { desc: 'Netflix', amount: 15.99, catIdx: 5 },
      { desc: 'Gym Membership', amount: 45, catIdx: 8 },
      { desc: 'Amazon Shopping', amount: 80 + Math.random() * 120, catIdx: 4 },
    ];

    for (const expense of expenseData) {
      transactions.push({
        amount: expense.amount,
        type: TransactionType.EXPENSE,
        description: expense.desc,
        date: new Date(month.getFullYear(), month.getMonth(), Math.floor(Math.random() * 28) + 1),
        userId: user.id,
        categoryId: expenseCategories[expense.catIdx].id,
      });
    }
  }

  await prisma.transaction.createMany({
    data: transactions.map((t) => ({ ...t, amount: parseFloat(t.amount.toFixed(2)) })),
    skipDuplicates: true,
  });

  console.log(`✅ Created ${transactions.length} sample transactions`);
  console.log('🎉 Seed completed successfully!');
  console.log('\n📧 Demo credentials:');
  console.log('   Email: demo@financetracker.app');
  console.log('   Password: demo123456');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
