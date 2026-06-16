import { PrismaClient } from "@prisma/client";
import { calculatePublic, makeSlug } from "../src/lib/public-carbon";
const prisma = new PrismaClient();

async function main() {
  const slug = makeSlug();
  const result = calculatePublic({
    countryCode: "IN",
    carKmPerMonth: 400,
    fuelType: "PETROL",
    publicTransportPerWeek: 4,
    flightsPerYear: 2,
    electricityKwhPerMonth: 250,
    acHoursPerDay: 5,
    renewablePct: 14,
    diet: "MIXED",
    shoppingScore: 2,
  });
  const calc = await prisma.publicCalculation.create({
    data: {
      slug,
      name: "Demo User",
      citySlug: "mumbai",
      countryCode: "IN",
      carKmPerMonth: 400, fuelType: "PETROL", publicTransportPerWeek: 4,
      flightsPerYear: 2, electricityKwhPerMonth: 250, acHoursPerDay: 5,
      renewablePct: 14, diet: "MIXED", shoppingScore: 2,
      transportationCo2: result.transportationCo2,
      energyCo2: result.energyCo2,
      foodCo2: result.foodCo2,
      shoppingCo2: result.shoppingCo2,
      totalCo2: result.totalCo2,
      grade: result.grade,
    },
  });
  console.log(`SLUG=${calc.slug} TOTAL=${result.totalCo2.toFixed(1)}kg GRADE=${result.grade}`);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
