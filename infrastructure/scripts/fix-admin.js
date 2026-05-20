const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Traveloop@123!', 12);
  console.log('Generated hash:', hash);
  
  const user = await prisma.user.update({
    where: { email: 'admin@traveloop.com' },
    data: { password_hash: hash, is_admin: true },
  });
  
  console.log('Updated user:', user.email, '| is_admin:', user.is_admin);
  console.log('Hash stored:', user.password_hash.substring(0, 10) + '...');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
