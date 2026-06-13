import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = "ajayyaswanth88@gmail.com";
  const newPassword = "Ajay@12345";

  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  console.log("Password reset done:", user.email);
}

main()
  .catch((error) => {
    console.error("REAL ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });