import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding demo data...");

  // 1. Check or create demo user
  const existingUser = await prisma.user.findUnique({
    where: { email: "demo@busbook.com" },
  });

  if (!existingUser) {
    console.log("Creating demo user...");
    await auth.api.signUpEmail({
      body: {
        email: "demo@busbook.com",
        password: "Demo@12345",
        name: "Demo Passenger",
      },
    });
    console.log("✓ Demo user created: demo@busbook.com / Demo@12345");
  } else {
    console.log("✓ Demo user already exists: demo@busbook.com");
  }

  // 2. Create sample Route
  const route = await prisma.route.upsert({
    where: { id: "demo-route-1" },
    update: {},
    create: {
      id: "demo-route-1",
      source: "New Delhi",
      destination: "Jaipur",
      distanceKm: 280,
      durationHrs: 5.5,
    },
  });
  console.log("✓ Demo Route created: New Delhi -> Jaipur");

  // 3. Create sample Bus
  const bus = await prisma.bus.upsert({
    where: { busNumber: "DL-01-BB-2026" },
    update: {},
    create: {
      id: "demo-bus-1",
      busNumber: "DL-01-BB-2026",
      operator: "BusBook Express",
      totalSeats: 30,
      busType: "AC Sleeper (2+1)",
      routeId: route.id,
    },
  });
  console.log("✓ Demo Bus created:", bus.busNumber);

  // 4. Create sample Seats
  for (let i = 1; i <= 10; i++) {
    const seatNumber = `A${i}`;
    await prisma.seat.upsert({
      where: {
        busId_seatNumber: {
          busId: bus.id,
          seatNumber,
        },
      },
      update: {},
      create: {
        seatNumber,
        isBooked: i <= 2, // First 2 seats booked
        busId: bus.id,
      },
    });
  }
  console.log("✓ 10 Demo Seats created for bus");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
