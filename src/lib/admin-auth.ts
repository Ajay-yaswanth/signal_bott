import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getAdminUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      id: session.user.id,
      role: "ADMIN",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}
