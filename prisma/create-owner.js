require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.OWNER_EMAIL;
  const rawPassword = process.env.OWNER_PASSWORD;

  if (!email || !rawPassword) {
    console.error("OWNER_EMAIL and OWNER_PASSWORD must be set in .env");
    process.exit(1);
  }

  const password = await bcrypt.hash(rawPassword, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: "OWNER",
      password,
    },
    create: {
      email,
      password,
      name: "Andrea",
      role: "OWNER",
    },
  });

  console.log(`Owner account ready: ${user.email} (role: ${user.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
