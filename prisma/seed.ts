import { PrismaClient, BadgeTier, ChallengeStatus, ActivityCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding GreenSteps...");

  await prisma.badge.createMany({
    data: [
      { slug: "eco-beginner", name: "Eco Beginner", description: "Logged your first activity", tier: BadgeTier.BEGINNER, threshold: 1 },
      { slug: "carbon-warrior", name: "Carbon Warrior", description: "Saved 50kg of CO₂", tier: BadgeTier.WARRIOR, threshold: 50 },
      { slug: "sustainability-champion", name: "Sustainability Champion", description: "Saved 250kg of CO₂", tier: BadgeTier.CHAMPION, threshold: 250 },
      { slug: "green-hero", name: "Green Hero", description: "Saved 1 ton of CO₂", tier: BadgeTier.HERO, threshold: 1000 },
    ],
    skipDuplicates: true,
  });

  const now = new Date();
  const inDays = (n: number) => new Date(now.getTime() + n * 86_400_000);

  await prisma.challenge.createMany({
    data: [
      {
        slug: "no-car-week",
        title: "No-Car Week",
        description: "Skip the car for a full week — bus, bike, walk, train.",
        category: ActivityCategory.TRANSPORTATION,
        targetCo2Saved: 30,
        rewardPoints: 200,
        status: ChallengeStatus.ACTIVE,
        startDate: now,
        endDate: inDays(7),
      },
      {
        slug: "green-energy-challenge",
        title: "Green Energy Challenge",
        description: "Cut electricity use by 20% this month.",
        category: ActivityCategory.ENERGY,
        targetCo2Saved: 40,
        rewardPoints: 250,
        status: ChallengeStatus.ACTIVE,
        startDate: now,
        endDate: inDays(30),
      },
      {
        slug: "plant-based-month",
        title: "Plant-Based Month",
        description: "Choose plant-based meals for 30 days.",
        category: ActivityCategory.FOOD,
        targetCo2Saved: 50,
        rewardPoints: 300,
        status: ChallengeStatus.UPCOMING,
        startDate: inDays(7),
        endDate: inDays(37),
      },
    ],
    skipDuplicates: true,
  });

  await prisma.document.createMany({
    data: [
      {
        title: "Reducing Transportation Emissions",
        category: "transportation",
        source: "EPA",
        content:
          "Switching from a gasoline vehicle to public transit can reduce per-passenger emissions by 45%. Cycling and walking produce zero direct emissions. Electric vehicles emit roughly 60% less CO₂ over their lifetime compared to internal combustion vehicles when charged on a typical grid. Carpooling halves per-person commute emissions. Working from home 2 days per week reduces annual commute emissions by about 40%.",
      },
      {
        title: "Home Energy Efficiency",
        category: "energy",
        source: "IEA",
        content:
          "LED lighting uses up to 75% less energy than incandescent. Setting AC at 24°C instead of 20°C can cut cooling energy by 20–30%. Rooftop solar in sunny regions can offset 70–100% of household electricity. Sealing air leaks around doors and windows reduces heating and cooling losses by 10–20%. 5-star BEE-rated appliances use up to 50% less power than 1-star equivalents.",
      },
      {
        title: "Sustainable Diet Choices",
        category: "food",
        source: "FAO",
        content:
          "A plant-based diet has roughly half the carbon footprint of a meat-heavy one. Beef produces ~27kg CO₂ per kg of meat — chicken is 6.9kg, lentils 0.9kg, rice 4kg, vegetables under 0.5kg. Reducing food waste by 50% can cut household food emissions ~10%. Locally grown seasonal produce reduces transport emissions and supports farmer livelihoods.",
      },
      {
        title: "India's Electricity Grid Mix",
        category: "energy",
        source: "CEA India",
        content:
          "India's grid emission factor is approximately 0.82 kg CO₂ per kWh in 2023 — among the world's most carbon-intensive due to ~70% coal dependence. Renewable share has grown from 7% in 2014 to over 22% in 2024, with solar leading at 89 GW installed capacity. State variations are wide: Karnataka and Tamil Nadu lead with 34% and 24% renewable share; coal-heavy states like Madhya Pradesh and Chhattisgarh sit near 12%.",
      },
      {
        title: "Electric Vehicles in India",
        category: "transportation",
        source: "NITI Aayog",
        content:
          "EVs in India produce ~60% less lifecycle CO₂ than petrol cars even on today's coal-heavy grid. The savings widen as renewables grow. Two-wheeler EVs are the most cost-effective transition for Indian households — petrol equivalents cost ~₹3.50/km, while electric two-wheelers run at ₹0.25/km. FAME-II subsidies reduce upfront costs by 25–40%. Charging at night uses surplus grid capacity and is cheapest.",
      },
      {
        title: "Air Pollution and Personal Choices",
        category: "health",
        source: "WHO",
        content:
          "Delhi's winter PM2.5 averages 200–500 µg/m³ — 10 to 25 times the WHO guideline of 15. Vehicle exhaust contributes 25–40% of urban PM2.5 in Indian metros. Switching one daily car trip to public transit reduces personal contribution to local air pollution while cutting CO₂. Wearing an N95 on high-pollution days reduces inhaled PM2.5 by 90%.",
      },
      {
        title: "Rooftop Solar Payback in India",
        category: "energy",
        source: "MNRE",
        content:
          "A 3 kW residential rooftop solar system in India typically costs ₹1.8–2.5 lakh after subsidies and generates ~4,000–4,500 kWh per year. Payback period in southern and western India is 4–6 years; system life is 25 years. Lifetime savings exceed ₹6 lakh per household. Subsidies under PM Surya Ghar provide 60% off the first 2 kW and 40% off the next 1 kW for residential users.",
      },
      {
        title: "Fast Fashion Footprint",
        category: "shopping",
        source: "UN Environment",
        content:
          "The global fashion industry produces 10% of all human-caused CO₂ emissions — more than international flights and shipping combined. A single new cotton t-shirt requires 2,700 litres of water and emits 7 kg CO₂. A new pair of jeans emits 33 kg CO₂. Buying secondhand or extending garment life by 9 months reduces water, waste, and emissions footprints by 20–30% each.",
      },
      {
        title: "Carbon Offsets — What Actually Works",
        category: "general",
        source: "Oxford Net Zero",
        content:
          "Most cheap carbon offsets ($5–10/ton) fund avoided-deforestation projects with weak additionality — independent audits find 90%+ overestimation in some programs. High-quality removal offsets (direct air capture, biochar, reforestation with permanence) cost $50–500 per ton. Best practice: reduce first, then offset only the unavoidable residual.",
      },
      {
        title: "Indian Monsoon and Climate Change",
        category: "climate",
        source: "IPCC AR6",
        content:
          "India's southwest monsoon has become more erratic since 1980: total seasonal rainfall is similar, but it now arrives in fewer, more intense events with longer dry spells. By 2050, IPCC projections show 5–15% more total monsoon rainfall but with 20–30% higher variability — meaning more floods and more droughts in the same year. Mumbai, Chennai, and Kolkata each face rising risk of monsoon-season flooding.",
      },
      {
        title: "Urban Heat Islands in Indian Cities",
        category: "climate",
        source: "TERI",
        content:
          "Indian metro cores run 2–6°C hotter than nearby rural areas due to dense concrete and reduced tree cover. Delhi's 2024 heatwave reached 52.9°C in some neighborhoods. Painting roofs white reduces indoor temperatures 2–5°C and cooling energy use 20%. Increasing urban tree cover by 10% lowers neighborhood ambient temperature by 1°C in summer.",
      },
      {
        title: "Single-Use Plastic and Personal Footprint",
        category: "shopping",
        source: "UNEP",
        content:
          "Producing 1 kg of plastic emits 2.5–5 kg of CO₂ depending on feedstock. The average urban Indian uses about 11 kg of plastic per year, with ~4 kg being single-use packaging. Switching to a reusable water bottle saves about 156 plastic bottles per year per person. Cloth shopping bags replace ~300 plastic bags annually per family.",
      },
      {
        title: "Composting Household Waste",
        category: "food",
        source: "BARC India",
        content:
          "About 50% of urban Indian household waste is organic. When this organic waste reaches a landfill, it generates methane — a greenhouse gas 28 times more potent than CO₂ per kg. Home composting diverts this, reducing per-household emissions by 100–200 kg CO₂-equivalent per year, and produces ~50 kg of soil-quality compost annually.",
      },
      {
        title: "Energy Efficient Cooking",
        category: "energy",
        source: "PPAC India",
        content:
          "LPG cooking emits ~3.0 kg CO₂ per kg of fuel. Induction cooktops powered by India's grid currently emit about 20% less CO₂ per meal than LPG, and the gap widens as the grid greens. Pressure cookers reduce cooking energy by 30–50% versus open-pot cooking. Solar cookers, where feasible, eliminate cooking emissions entirely for 200+ days a year in most of India.",
      },
      {
        title: "Walking and Cycling for Health and Climate",
        category: "transportation",
        source: "Lancet Planetary Health",
        content:
          "Replacing one short car trip per day with cycling saves about 0.5 kg CO₂ and burns 100–200 calories. People who commute by bicycle have 41% lower all-cause mortality compared to car commuters. Indian cities adding protected bike lanes see ridership grow 20–40% within two years.",
      },
    ],
    skipDuplicates: true,
  });

  // Cities — civic dashboards. India-focused per challenge audience.
  await prisma.city.createMany({
    data: [
      {
        slug: "mumbai",
        name: "Mumbai",
        countryCode: "IN",
        population: 20_400_000,
        gridFactor: 0.78,
        renewableSharePct: 28,
        percapitaTonsYr: 2.6,
        transportShare: 0.21,
        energyShare: 0.44,
        industryShare: 0.21,
        agricultureShare: 0.04,
        topAction: "Switch to BEST electric buses + use 5-star ACs",
        context:
          "Mumbai's per-capita footprint runs ~37% above India's average because of dense commercial activity and heavy AC use 9 months/year. Maharashtra's grid is 28% renewable — choosing a green tariff cuts ~30% off your electric bill emissions.",
      },
      {
        slug: "delhi",
        name: "Delhi",
        countryCode: "IN",
        population: 32_900_000,
        gridFactor: 0.91,
        renewableSharePct: 14,
        percapitaTonsYr: 3.1,
        transportShare: 0.32,
        energyShare: 0.41,
        industryShare: 0.18,
        agricultureShare: 0.03,
        topAction: "Use Delhi Metro + replace old diesel vehicles",
        context:
          "Delhi's grid is among India's most coal-heavy (91% non-renewable). Transport contributes 32% of emissions and a large share of PM2.5. Metro + EV adoption is the single highest leverage point for residents.",
      },
      {
        slug: "bengaluru",
        name: "Bengaluru",
        countryCode: "IN",
        population: 13_600_000,
        gridFactor: 0.74,
        renewableSharePct: 34,
        percapitaTonsYr: 2.2,
        transportShare: 0.27,
        energyShare: 0.42,
        industryShare: 0.16,
        agricultureShare: 0.07,
        topAction: "Carpool + work-from-home reduces commute emissions ~40%",
        context:
          "Karnataka has India's highest renewable share — wind + solar = 34% of grid. Commute traffic dominates avoidable emissions for Bengaluru's IT workforce.",
      },
      {
        slug: "chennai",
        name: "Chennai",
        countryCode: "IN",
        population: 11_500_000,
        gridFactor: 0.81,
        renewableSharePct: 24,
        percapitaTonsYr: 2.4,
        transportShare: 0.23,
        energyShare: 0.46,
        industryShare: 0.20,
        agricultureShare: 0.05,
        topAction: "Rooftop solar can offset 60% of household electricity",
        context:
          "Chennai's coastal sun + Tamil Nadu's solar push make rooftop PV exceptional ROI here — payback under 5 years for a 3kW system.",
      },
      {
        slug: "hyderabad",
        name: "Hyderabad",
        countryCode: "IN",
        population: 10_500_000,
        gridFactor: 0.79,
        renewableSharePct: 26,
        percapitaTonsYr: 2.3,
        transportShare: 0.25,
        energyShare: 0.45,
        industryShare: 0.18,
        agricultureShare: 0.06,
        topAction: "TSRTC bus + Hyderabad Metro for commute",
        context:
          "Telangana's grid is steadily greening (26% renewable). Cooling demand 8 months/year makes AC efficiency the single biggest household lever.",
      },
    ],
    skipDuplicates: true,
  });

  // Seed a handful of pledges so the wall isn't empty on first load.
  await prisma.pledge.createMany({
    data: [
      {
        name: "Priya R.",
        city: "Mumbai",
        message: "I will use Mumbai Local + bike for all trips under 5km this month.",
        category: "transport",
        estCo2: 18,
      },
      {
        name: "Arjun K.",
        city: "Bengaluru",
        message: "Work from home 3 days a week and skip the 22km commute.",
        category: "transport",
        estCo2: 42,
      },
      {
        name: "Sara M.",
        city: "Delhi",
        message: "Two plant-based dinners a week — no more daily butter chicken.",
        category: "food",
        estCo2: 25,
      },
      {
        name: "Rahul V.",
        city: "Chennai",
        message: "Installing a 3kW rooftop solar this quarter.",
        category: "energy",
        estCo2: 180,
      },
      {
        name: "Lena Y.",
        city: "Hyderabad",
        message: "No fast fashion for the next 6 months — secondhand only.",
        category: "shopping",
        estCo2: 15,
      },
    ],
    skipDuplicates: true,
  });

  // Index documents into pgvector so the RAG chatbot has real sources to cite.
  // Skips gracefully if Gemini isn't configured (e.g. on CI).
  const hasKey =
    !!process.env.GEMINI_API_KEY ||
    !!process.env.GOOGLE_AI_API_KEY ||
    !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (hasKey) {
    const docs = await prisma.document.findMany();
    let indexed = 0;
    for (const d of docs) {
      const existing = await prisma.embedding.count({ where: { documentId: d.id } });
      if (existing > 0) continue;
      try {
        // Dynamic import — keeps tsx from loading Gemini if no key
        const { indexDocument } = await import("../src/lib/rag");
        await indexDocument(d.id, d.content);
        indexed++;
      } catch (e) {
        console.warn(`  ! Skipped embedding for "${d.title}": ${(e as Error).message}`);
      }
    }
    console.log(`Indexed ${indexed} document(s) into pgvector.`);
  } else {
    console.log("Gemini key not set — skipped embedding step.");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
