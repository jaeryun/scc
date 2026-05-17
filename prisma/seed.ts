import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.ipAddress.deleteMany();
  await prisma.subnet.deleteMany();

  await prisma.subnet.create({
    data: {
      network: "192.168.1.0/24",
      description: "사무실 네트워크",
      vlanId: "100",
      purpose: "서비스-PM",
      centers: ["상암", "야탑"],
      ipAddresses: {
        create: [
          { ip: "192.168.1.1", status: "ALLOCATED", hostname: "gw-router", description: "게이트웨이" },
          { ip: "192.168.1.10", status: "ALLOCATED", hostname: "server-01", description: "메인 서버" },
          { ip: "192.168.1.11", status: "FREE" },
          { ip: "192.168.1.12", status: "RESERVED", description: "예약" },
          { ip: "192.168.1.20", status: "ALLOCATED", hostname: "workstation-01" },
          { ip: "192.168.1.21", status: "FREE" },
          { ip: "192.168.1.22", status: "ALLOCATED", hostname: "monitoring-01" },
          { ip: "192.168.1.50", status: "ALLOCATED", hostname: "web-server-03" },
          { ip: "192.168.1.100", status: "DISABLED", description: "비활성" },
        ],
      },
    },
  });

  await prisma.subnet.create({
    data: {
      network: "10.0.0.0/24",
      description: "서버 네트워크",
      vlanId: "200",
      purpose: "서비스-VM",
      centers: ["상암"],
      ipAddresses: {
        create: [
          { ip: "10.0.0.1", status: "ALLOCATED", hostname: "core-switch" },
          { ip: "10.0.0.10", status: "ALLOCATED", hostname: "db-server" },
          { ip: "10.0.0.11", status: "FREE" },
          { ip: "10.0.0.18", status: "ALLOCATED", hostname: "web-cache-01" },
          { ip: "10.0.0.20", status: "ALLOCATED", hostname: "old-db" },
        ],
      },
    },
  });

  await prisma.subnet.create({
    data: {
      network: "172.16.0.0/23",
      description: "백업 네트워크",
      purpose: "백업",
      centers: ["죽전", "AI센터"],
      ipAddresses: {
        create: [
          { ip: "172.16.0.1", status: "ALLOCATED", hostname: "backup-master" },
          { ip: "172.16.0.2", status: "FREE" },
          { ip: "172.16.0.5", status: "ALLOCATED", hostname: "web-frontend" },
          { ip: "172.16.0.10", status: "ALLOCATED", hostname: "api-gateway" },
          { ip: "172.16.0.20", status: "FREE" },
          { ip: "172.16.0.100", status: "RESERVED", description: "예약" },
        ],
      },
    },
  });

  await prisma.subnet.create({
    data: {
      network: "10.10.10.0/24",
      description: "OOB 관리 네트워크",
      vlanId: "300",
      purpose: "OOB",
      centers: ["상암", "AI센터"],
      ipAddresses: {
        create: [
          { ip: "10.10.10.1", status: "ALLOCATED", hostname: "oob-gw" },
          { ip: "10.10.10.2", status: "FREE" },
          { ip: "10.10.10.5", status: "ALLOCATED", hostname: "oob-switch-01" },
          { ip: "10.10.10.88", status: "ALLOCATED", hostname: "test-vm" },
        ],
      },
    },
  });

  await prisma.subnet.create({
    data: {
      network: "192.168.100.0/24",
      description: "H-B 클러스터 네트워크",
      vlanId: "400",
      purpose: "H-B",
      centers: ["야탑", "죽전"],
      ipAddresses: {
        create: [
          { ip: "192.168.100.1", status: "ALLOCATED", hostname: "hb-node-01" },
          { ip: "192.168.100.2", status: "ALLOCATED", hostname: "hb-node-02" },
          { ip: "192.168.100.10", status: "FREE" },
          { ip: "192.168.100.11", status: "FREE" },
        ],
      },
    },
  });

  await prisma.subnet.create({
    data: {
      network: "10.20.0.0/24",
      description: "NAS 스토리지 네트워크",
      vlanId: "500",
      purpose: "NAS",
      centers: ["AI센터"],
      ipAddresses: {
        create: [
          { ip: "10.20.0.1", status: "ALLOCATED", hostname: "nas-controller" },
          { ip: "10.20.0.2", status: "ALLOCATED", hostname: "nas-node-01" },
          { ip: "10.20.0.3", status: "FREE" },
          { ip: "10.20.0.4", status: "FREE" },
        ],
      },
    },
  });

  console.log("Seeded: 6 subnets with IP addresses");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
