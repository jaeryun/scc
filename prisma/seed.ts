import { prisma } from "../src/lib/prisma";

async function main() {
  // Create sample subnet with IP addresses
  const subnet = await prisma.subnet.create({
    data: {
      network: "192.168.1.0/24",
      description: "사무실 네트워크",
      vlanId: "100",
      ipAddresses: {
        create: [
          { ip: "192.168.1.1", status: "ALLOCATED", hostname: "gw-router", description: "게이트웨이" },
          { ip: "192.168.1.10", status: "ALLOCATED", hostname: "server-01", description: "메인 서버" },
          { ip: "192.168.1.11", status: "FREE", description: "미사용" },
          { ip: "192.168.1.12", status: "RESERVED", description: "예약" },
          { ip: "192.168.1.20", status: "ALLOCATED", hostname: "workstation-01" },
          { ip: "192.168.1.21", status: "FREE" },
          { ip: "192.168.1.100", status: "DISABLED", description: "비활성" },
        ],
      },
    },
  });

  // Create another subnet
  const subnet2 = await prisma.subnet.create({
    data: {
      network: "10.0.0.0/24",
      description: "서버 네트워크",
      vlanId: "200",
      ipAddresses: {
        create: [
          { ip: "10.0.0.1", status: "ALLOCATED", hostname: "core-switch" },
          { ip: "10.0.0.10", status: "ALLOCATED", hostname: "db-server" },
          { ip: "10.0.0.11", status: "FREE" },
        ],
      },
    },
  });

  console.log("Seeded:", { subnet, subnet2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
