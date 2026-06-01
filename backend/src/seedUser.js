import bcrypt from "bcryptjs";
import prisma from "./config/prisma.js";

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  const user = await prisma.users.upsert({
    where: {
      email: "admin@gmail.com",
    },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      full_name: "System Admin",
      email: "admin@gmail.com",
      phone: "0900000000",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("Created user:", user);
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
