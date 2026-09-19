import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function hash(plain: string) {
  return bcrypt.hash(plain, 10);
}

const STORY_BODIES = {
  lineOfTraders: `The line at Soweto Market started forming before the sun cleared the jacarandas, and Mutinta had learned long ago that the first hour belonged to the serious buyers — the ones who came with baskets, not curiosity.

She sold dried kapenta from the same corner her mother had used for eleven years, and before that, her grandmother had sold groundnuts twenty metres further down, where the tarmac cracked into a shape like a river delta. Everyone in the market knew the shape. They used it for directions the way other cities used street names.

"Two for fifteen," she told the man in the blue overalls, and he laughed the way men laughed when they thought a woman had made an error in their favour, and paid without checking his change.

By midday the heat had flattened every argument in the market into a low drone of bargaining, and Mutinta thought, as she often did, about the letter still folded in her chitenge pocket — the one from the cooperative offering to buy her stock wholesale, cutting out the market entirely, cutting out the corner, cutting out the shape in the tarmac that had outlived two generations of women who understood exactly what it was worth to stand there.

She did not open the letter again. She had read it enough times to know what it asked of her, and what it did not know to ask.`,
  theCallFromLusaka: `The phone rang twice before Bo Chanda picked it up, already knowing from the country code that it was his son calling from Lusaka, and already composing, in the half-second before he answered, the sentence he would use to avoid asking about money.

"Bo, how is Mwansa's cough?" His son's voice had the compressed, efficient warmth of a man budgeting his data bundle.

"Better. She is back at school." This was not entirely true. She had gone to school twice that week and come home early once, but the truth, delivered whole, invited more questions than Bo Chanda had airtime to answer.

They spoke of the rains, which had come late and then all at once, flooding the low field behind the house where his son had learned to walk. They spoke of a cousin's wedding neither of them would attend. And then, because there is only so long two men can hold a phone call open with weather and family before the actual shape of the call reveals itself, his son said: "I sent something. Check with Mai Ng'andu at the tuck shop, she has the agent line."

Bo Chanda thanked him in the unhurried way of a man who intends to walk to the tuck shop that same afternoon, though not too quickly, because arriving too quickly would say something about need that he preferred to leave unsaid between them, even now, even three hundred kilometres and a whole difficult life apart.`,
  theWatchmanOfKabwata: `Mr. Sikazwe had watched the gate of the Kabwata compound for nineteen years, long enough to have opinions about every tenant who had ever lived behind it, and long enough that the landlord no longer bothered giving him instructions beyond a nod each January when the rent increased.

He kept a small radio tuned to the football, and a chair with one leg shorter than the others, propped level with a folded copy of a newspaper so old the football scores it reported were now just history. From this chair he had seen three marriages arranged, one annulled loudly enough for the whole street to adjudicate, and dozens of small crimes too minor to report — a stolen hosepipe, a borrowed ladder that never returned, a dog that ate someone's Sunday chicken through an unlatched gate that was, Mr. Sikazwe would maintain to his last day, not his responsibility to have checked.

Tonight the compound was unusually quiet. The new tenant in Flat 4 — a young woman who worked, as far as he could tell, entirely from a laptop and never for the same company twice — had not returned home by nine, which was itself unremarkable, except that her light was on. She always turned her light off when she left, an economy he had noticed and privately admired.

Mr. Sikazwe adjusted his chair, and waited, because waiting was, in the end, the whole of the job, and he had never once considered it beneath him.`,
} as const;

const ANTHOLOGY_BODIES = {
  copperlineDusk: `Copperline Dusk gathers twelve stories written across three decades on the Copperbelt, tracing the province's fortunes through the people who never appear in the production reports — the machine operators, the market women who fed them, the children who grew up counting shift-change whistles instead of church bells.

The opening story follows a shaft sinker's widow settling an estate that consists mostly of debt and a single, oddly specific promise: that her husband's boots be returned to the mine, not buried with him. What follows across the collection is less a chronicle of an industry than a chronicle of the arrangements people make with an industry that does not know their names.

Mockingbird Digital compiled this edition from archival submissions, family collections, and two previously unpublished manuscripts recovered from a shuttered union hall in Kitwe. Editorial notes accompany each piece, situating them in the labour history most textbooks compress into a single paragraph.`,
  riverAlmanac: `The River Almanac is Mockingbird Digital's annual survey of short fiction set along the Zambezi, the Kafue, and the smaller tributaries that rarely earn a name on any map larger than a district survey.

This edition's eight stories share a preoccupation with thresholds — the line between wet and dry season, between one chief's territory and the next, between a fisherman's version of events and his wife's. None of the stories resolve tidily, which the editors consider a feature rather than an oversight: rivers, after all, are not in the business of conclusions.

Readers familiar with previous almanacs will recognise the same commitment to unglamorous specificity — the actual price of diesel for a pump-boat, the actual argument over a dowry paid partly in cattle and partly in a phone with a cracked screen. The particulars, Mockingbird Digital believes, are where the truth of a place actually lives.`,
} as const;

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@utushimi.africa" },
    update: {},
    create: {
      email: "admin@utushimi.africa",
      name: "Editorial Desk",
      passwordHash: await hash("AdminPass123!"),
      role: "ADMIN",
    },
  });

  const chanda = await prisma.user.upsert({
    where: { email: "chanda@utushimi.africa" },
    update: {},
    create: {
      email: "chanda@utushimi.africa",
      name: "Chanda Mwila",
      phone: "0977100001",
      passwordHash: await hash("WriterPass123!"),
      role: "WRITER",
      writerProfile: {
        create: { bio: "Writes about market life in Lusaka.", payoutPhone: "0977100001", payoutNetwork: "MTN" },
      },
    },
    include: { writerProfile: true },
  });

  const bwalya = await prisma.user.upsert({
    where: { email: "bwalya@utushimi.africa" },
    update: {},
    create: {
      email: "bwalya@utushimi.africa",
      name: "Bwalya Phiri",
      phone: "0966100002",
      passwordHash: await hash("WriterPass123!"),
      role: "WRITER",
      writerProfile: { create: { bio: "Diaspora and family stories." } },
    },
    include: { writerProfile: true },
  });

  const natasha = await prisma.user.upsert({
    where: { email: "natasha@utushimi.africa" },
    update: {},
    create: {
      email: "natasha@utushimi.africa",
      name: "Natasha Zulu",
      phone: "0955100003",
      passwordHash: await hash("WriterPass123!"),
      role: "WRITER",
      writerProfile: {
        create: { bio: "Compound life and quiet observation.", payoutPhone: "0955100003", payoutNetwork: "AIRTEL" },
      },
    },
    include: { writerProfile: true },
  });

  const mulenga = await prisma.user.upsert({
    where: { email: "mulenga@utushimi.africa" },
    update: {},
    create: {
      email: "mulenga@utushimi.africa",
      name: "Mulenga Banda",
      phone: "0977200001",
      passwordHash: await hash("ReaderPass123!"),
      role: "READER",
    },
  });

  const kunda = await prisma.user.upsert({
    where: { email: "kunda@utushimi.africa" },
    update: {},
    create: {
      email: "kunda@utushimi.africa",
      name: "Kunda Sakala",
      phone: "0966200002",
      passwordHash: await hash("ReaderPass123!"),
      role: "READER",
    },
  });

  const storyApproved1 = await prisma.story.upsert({
    where: { slug: "the-line-of-traders" },
    update: {},
    create: {
      writerId: chanda.id,
      title: "The Line of Traders",
      slug: "the-line-of-traders",
      genre: "FICTION",
      priceNgwee: 1500,
      coverText:
        "A market vendor at Soweto Market weighs a cooperative's buyout offer against three generations of claim to a single corner of tarmac.",
      body: STORY_BODIES.lineOfTraders,
      previewCutoff: 480,
      readTimeMinutes: 6,
      status: "APPROVED",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
    },
  });

  const storyApproved2 = await prisma.story.upsert({
    where: { slug: "the-call-from-lusaka" },
    update: {},
    create: {
      writerId: chanda.id,
      title: "The Call From Lusaka",
      slug: "the-call-from-lusaka",
      genre: "DRAMA",
      priceNgwee: 1200,
      coverText:
        "A father and his city-working son navigate a phone call neither of them wants to make about money.",
      body: STORY_BODIES.theCallFromLusaka,
      previewCutoff: 420,
      readTimeMinutes: 5,
      status: "APPROVED",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
    },
  });

  await prisma.story.upsert({
    where: { slug: "the-watchman-of-kabwata" },
    update: {},
    create: {
      writerId: natasha.id,
      title: "The Watchman of Kabwata",
      slug: "the-watchman-of-kabwata",
      genre: "FICTION",
      priceNgwee: 1000,
      coverText: "Nineteen years watching one gate has taught Mr. Sikazwe everything except what to do tonight.",
      body: STORY_BODIES.theWatchmanOfKabwata,
      previewCutoff: 500,
      readTimeMinutes: 5,
      status: "APPROVED",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
  });

  await prisma.story.upsert({
    where: { slug: "unsettled-accounts" },
    update: {},
    create: {
      writerId: bwalya.id,
      title: "Unsettled Accounts",
      slug: "unsettled-accounts",
      genre: "DRAMA",
      priceNgwee: 1300,
      coverText: "A family reckons with an inheritance that is mostly obligation.",
      body: STORY_BODIES.theCallFromLusaka,
      previewCutoff: 350,
      readTimeMinutes: 5,
      status: "REJECTED",
      rejectionNotes:
        "Strong voice, but the ending needs another pass — it resolves the money plot but leaves the father/son tension unaddressed. Please resubmit.",
    },
  });

  await prisma.story.upsert({
    where: { slug: "the-late-rains" },
    update: {},
    create: {
      writerId: chanda.id,
      title: "The Late Rains",
      slug: "the-late-rains",
      genre: "FICTION",
      priceNgwee: 1400,
      coverText: "A new submission awaiting its first editorial read.",
      body: STORY_BODIES.lineOfTraders,
      previewCutoff: 400,
      readTimeMinutes: 6,
      status: "PENDING_REVIEW",
    },
  });

  // Completed purchases with ledger entries in every state, so the payout page has real data.
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;

  async function seedCompletedPurchase(opts: {
    readerId: string;
    story: { id: string; priceNgwee: number };
    writerProfileId: string;
    daysAgo: number;
    ledgerStatus: "HELD" | "ELIGIBLE" | "PAID";
  }) {
    const platformCutNgwee = Math.round(opts.story.priceNgwee * 0.3);
    const writerCutNgwee = opts.story.priceNgwee - platformCutNgwee;
    const purchasedAt = new Date(now - opts.daysAgo * day);

    const purchase = await prisma.purchase.create({
      data: {
        readerId: opts.readerId,
        storyId: opts.story.id,
        amountNgwee: opts.story.priceNgwee,
        platformCutNgwee,
        writerCutNgwee,
        network: "MTN",
        phone: "0977300000",
        provider: "mock",
        status: "COMPLETED",
        purchasedAt,
        completedAt: purchasedAt,
      },
    });

    let payoutId: string | undefined;
    if (opts.ledgerStatus === "PAID") {
      const payout = await prisma.payout.create({
        data: {
          writerProfileId: opts.writerProfileId,
          totalAmountNgwee: writerCutNgwee,
          status: "PAID",
          network: "MTN",
          phone: "0977100001",
          provider: "mock",
          providerRef: "MOCK-DIS-seed",
          triggeredById: admin.id,
          paidAt: new Date(now - (opts.daysAgo - 8) * day),
        },
      });
      payoutId = payout.id;
    }

    await prisma.payoutLedgerEntry.create({
      data: {
        purchaseId: purchase.id,
        writerProfileId: opts.writerProfileId,
        amountNgwee: writerCutNgwee,
        status: opts.ledgerStatus,
        eligibleAt: new Date(purchasedAt.getTime() + 7 * day),
        payoutId,
      },
    });
  }

  await seedCompletedPurchase({
    readerId: mulenga.id,
    story: storyApproved1,
    writerProfileId: chanda.writerProfile!.id,
    daysAgo: 1,
    ledgerStatus: "HELD",
  });
  await seedCompletedPurchase({
    readerId: kunda.id,
    story: storyApproved1,
    writerProfileId: chanda.writerProfile!.id,
    daysAgo: 10,
    ledgerStatus: "ELIGIBLE",
  });
  await seedCompletedPurchase({
    readerId: mulenga.id,
    story: storyApproved2,
    writerProfileId: chanda.writerProfile!.id,
    daysAgo: 25,
    ledgerStatus: "PAID",
  });

  const anthology1 = await prisma.anthologyTitle.upsert({
    where: { slug: "copperline-dusk" },
    update: {},
    create: {
      title: "Copperline Dusk",
      slug: "copperline-dusk",
      coverText: "Twelve stories from three decades of Copperbelt life, compiled by Mockingbird Digital.",
      body: ANTHOLOGY_BODIES.copperlineDusk,
      previewCutoff: 420,
      priceNgwee: 4500,
      readTimeMinutes: 45,
      published: true,
      publishedAt: new Date(now - 30 * day),
    },
  });

  await prisma.anthologyTitle.upsert({
    where: { slug: "river-almanac" },
    update: {},
    create: {
      title: "The River Almanac",
      slug: "river-almanac",
      coverText: "Mockingbird Digital's annual survey of short fiction along Zambia's waterways.",
      body: ANTHOLOGY_BODIES.riverAlmanac,
      previewCutoff: 400,
      priceNgwee: 3800,
      readTimeMinutes: 38,
      published: true,
      publishedAt: new Date(now - 5 * day),
    },
  });

  await prisma.anthologyTitle.upsert({
    where: { slug: "highland-notebook" },
    update: {},
    create: {
      title: "Highland Notebook",
      slug: "highland-notebook",
      coverText: "An in-progress collection from the Nyika highlands. Not yet published.",
      body: ANTHOLOGY_BODIES.riverAlmanac,
      previewCutoff: 400,
      priceNgwee: 3500,
      readTimeMinutes: 30,
      published: false,
    },
  });

  await prisma.anthologyPurchase.create({
    data: {
      readerId: kunda.id,
      anthologyId: anthology1.id,
      amountNgwee: anthology1.priceNgwee,
      network: "AIRTEL",
      phone: "0966200002",
      provider: "mock",
      status: "COMPLETED",
      completedAt: new Date(now - 2 * day),
    },
  });

  console.log("Seed complete.");
  console.log("Admin login:  admin@utushimi.africa / AdminPass123!");
  console.log("Writer login: chanda@utushimi.africa / WriterPass123!");
  console.log("Reader login: mulenga@utushimi.africa / ReaderPass123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
