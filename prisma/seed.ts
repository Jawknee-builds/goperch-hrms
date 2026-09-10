import "dotenv/config";
import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting GoPerch HRMS database seed...");

  const defaultPasswordHash = await bcrypt.hash("password123", 10);

  // 1. Create 4 Departments
  const deptElectronics = await db.department.upsert({
    where: { code: "ELECTRONICS" },
    update: {},
    create: {
      name: "Electronics",
      code: "ELECTRONICS",
      description: "Hardware engineering, PCB design, and embedded firmware development.",
    },
  });

  const deptSoftware = await db.department.upsert({
    where: { code: "SOFTWARE" },
    update: {},
    create: {
      name: "Software",
      code: "SOFTWARE",
      description: "Web & cloud application development, AI infrastructure, and microservices.",
    },
  });

  const deptSales = await db.department.upsert({
    where: { code: "SALES" },
    update: {},
    create: {
      name: "Sales",
      code: "SALES",
      description: "B2B sales strategy, account management, and market expansion.",
    },
  });

  const deptLeadership = await db.department.upsert({
    where: { code: "LEADERSHIP" },
    update: {},
    create: {
      name: "Leadership",
      code: "LEADERSHIP",
      description: "Executive management, strategic growth, and cross-functional operations.",
    },
  });

  console.log("✅ 4 Departments created (Electronics, Software, Sales, Leadership)");

  // 2. Create CEO & HODs & Employees
  const ceo = await db.user.upsert({
    where: { email: "ceo@goperch.com" },
    update: { name: "Ryan Bantu (CEO)" },
    create: {
      email: "ceo@goperch.com",
      password: defaultPasswordHash,
      name: "Ryan Bantu (CEO)",
      role: "CEO",
      title: "Chief Executive Officer",
      departmentId: deptLeadership.id,
    },
  });

  // HODs
  const hodSoftware = await db.user.upsert({
    where: { email: "hod.software@goperch.com" },
    update: { name: "Prasanna (Software HOD)" },
    create: {
      email: "hod.software@goperch.com",
      password: defaultPasswordHash,
      name: "Prasanna (Software HOD)",
      role: "HOD",
      title: "Head of Software Engineering",
      departmentId: deptSoftware.id,
    },
  });

  const hodElectronics = await db.user.upsert({
    where: { email: "hod.electronics@goperch.com" },
    update: { name: "Vikram (Electronics HOD)" },
    create: {
      email: "hod.electronics@goperch.com",
      password: defaultPasswordHash,
      name: "Vikram (Electronics HOD)",
      role: "HOD",
      title: "Head of Electronics & Hardware",
      departmentId: deptElectronics.id,
    },
  });

  const hodSales = await db.user.upsert({
    where: { email: "hod.sales@goperch.com" },
    update: { name: "Jonathan Jaladi (Sales HOD)" },
    create: {
      email: "hod.sales@goperch.com",
      password: defaultPasswordHash,
      name: "Jonathan Jaladi (Sales HOD)",
      role: "HOD",
      title: "Head of Sales & Partnerships",
      departmentId: deptSales.id,
    },
  });

  const hodLeadership = await db.user.upsert({
    where: { email: "hod.leadership@goperch.com" },
    update: {},
    create: {
      email: "hod.leadership@goperch.com",
      password: defaultPasswordHash,
      name: "David Miller (Leadership HOD)",
      role: "HOD",
      title: "Chief Operating Officer",
      departmentId: deptLeadership.id,
    },
  });

  // Employees
  const empSoftware = await db.user.upsert({
    where: { email: "emp.software@goperch.com" },
    update: {},
    create: {
      email: "emp.software@goperch.com",
      password: defaultPasswordHash,
      name: "Alex Dev (Software Dev)",
      role: "EMPLOYEE",
      title: "Fullstack Engineer",
      departmentId: deptSoftware.id,
    },
  });

  const empElectronics = await db.user.upsert({
    where: { email: "emp.electronics@goperch.com" },
    update: {},
    create: {
      email: "emp.electronics@goperch.com",
      password: defaultPasswordHash,
      name: "Priya Patel (Hardware Eng)",
      role: "EMPLOYEE",
      title: "Embedded Systems Specialist",
      departmentId: deptElectronics.id,
    },
  });

  const empSales = await db.user.upsert({
    where: { email: "emp.sales@goperch.com" },
    update: {},
    create: {
      email: "emp.sales@goperch.com",
      password: defaultPasswordHash,
      name: "James Wilson (Sales Rep)",
      role: "EMPLOYEE",
      title: "Account Executive",
      departmentId: deptSales.id,
    },
  });

  console.log("✅ CEO, HODs, and Employees created");

  // 3. Create Projects (including CEO Top 3 Strategic Focus)
  const projAiPlatform = await db.project.create({
    data: {
      title: "GoPerch Enterprise AI Platform",
      description: "Deploy next-gen AI workforce telemetry and intelligent decision assistance across all customer organizations.",
      status: "IN_PROGRESS",
      progress: 68,
      isTopFocus: true, // CEO Top 1
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      departmentId: deptSoftware.id,
      createdById: ceo.id,
    },
  });

  const projIotHardware = await db.project.create({
    data: {
      title: "Smart Controller Chip V2",
      description: "Next-gen embedded sensor hub with ultra-low power consumption and real-time mesh connectivity.",
      status: "IN_PROGRESS",
      progress: 45,
      isTopFocus: true, // CEO Top 2
      targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      departmentId: deptElectronics.id,
      createdById: ceo.id,
    },
  });

  const projGlobalSales = await db.project.create({
    data: {
      title: "EMEA Enterprise Revenue Expansion",
      description: "Scaling B2B sales pipelines across European tech hubs with targeted direct account executive outreach.",
      status: "IN_PROGRESS",
      progress: 82,
      isTopFocus: true, // CEO Top 3
      targetDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      departmentId: deptSales.id,
      createdById: ceo.id,
    },
  });

  const projInternalHrms = await db.project.create({
    data: {
      title: "Internal HRMS 2.0 Revamp",
      description: "Upgrading core UI/UX with Next.js 16, visual project management, and real-time executive dashboard.",
      status: "IN_PROGRESS",
      progress: 90,
      isTopFocus: false,
      departmentId: deptSoftware.id,
      createdById: hodSoftware.id,
    },
  });

  // Project Notes
  await db.projectNote.createMany({
    data: [
      {
        content: "API endpoint latency reduced by 40% after implementing Prisma 7 connection pooling.",
        authorId: hodSoftware.id,
        projectId: projAiPlatform.id,
      },
      {
        content: "CEO requested live progress bar on executive view. Next.js App Router streaming enabled.",
        authorId: empSoftware.id,
        projectId: projAiPlatform.id,
      },
      {
        content: "PCB layer stackup finalized. Power regulator transient spike solved with soft-start cap.",
        authorId: empElectronics.id,
        projectId: projIotHardware.id,
      },
      {
        content: "Initial deal terms sent to 3 Tier-1 enterprise leads in London and Frankfurt.",
        authorId: hodSales.id,
        projectId: projGlobalSales.id,
      },
    ],
  });

  console.log("✅ Projects (including CEO Top 3 Strategic Focus) and Project Notes created");

  // 4. Create Default Chat Channels
  const chGeneral = await db.channel.upsert({
    where: { name: "general" },
    update: {},
    create: {
      name: "general",
      description: "Company-wide general announcements and casual chat.",
    },
  });

  const chSoftware = await db.channel.upsert({
    where: { name: "software-team" },
    update: {},
    create: {
      name: "software-team",
      description: "Software engineering discussion & release updates.",
      departmentId: deptSoftware.id,
    },
  });

  const chElectronics = await db.channel.upsert({
    where: { name: "electronics-team" },
    update: {},
    create: {
      name: "electronics-team",
      description: "Hardware prototypes, PCB design, and telemetry updates.",
      departmentId: deptElectronics.id,
    },
  });

  const chSales = await db.channel.upsert({
    where: { name: "sales-team" },
    update: {},
    create: {
      name: "sales-team",
      description: "B2B client deals and regional market expansion strategy.",
      departmentId: deptSales.id,
    },
  });

  const chLeadership = await db.channel.upsert({
    where: { name: "leadership-exec" },
    update: {},
    create: {
      name: "leadership-exec",
      description: "Executive strategy channel for CEO & HODs.",
      departmentId: deptLeadership.id,
    },
  });

  console.log("✅ Chat Channels created (#general, #software-team, #electronics-team, #sales-team, #leadership-exec)");

  // 4. Seed Initial Messages
  await db.message.create({
    data: {
      content: "Welcome everyone to the GoPerch HRMS operating system! Feel free to share updates here.",
      senderId: ceo.id,
      channelId: chGeneral.id,
    },
  });

  await db.message.create({
    data: {
      content: "Software team: Next.js 16 and Prisma 7 setup is live. Let's make sure all API endpoints are tested.",
      senderId: hodSoftware.id,
      channelId: chSoftware.id,
    },
  });

  // Direct Message (DM) sample: CEO to Software HOD
  await db.message.create({
    data: {
      content: "Hi Sarah, great progress on the Next.js launch! Let's align on the Q4 roadmap tomorrow.",
      senderId: ceo.id,
      recipientId: hodSoftware.id,
    },
  });

  console.log("✅ Initial Chat Messages & DMs created");

  // 5. Create Milestones
  const m1 = await db.milestone.create({
    data: {
      title: "Q3 HRMS Next.js App Launch",
      description: "Deliver full-stack Next.js 16 app with PostgreSQL database integration.",
      targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "IN_PROGRESS",
      departmentId: deptSoftware.id,
    },
  });

  const m2 = await db.milestone.create({
    data: {
      title: "IoT Controller Prototype v2",
      description: "Fabricate and test 4-layer PCB prototype for smart sensor telemetry.",
      targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: "IN_PROGRESS",
      departmentId: deptElectronics.id,
    },
  });

  const m3 = await db.milestone.create({
    data: {
      title: "Q3 Enterprise Expansion",
      description: "Close 5 major enterprise contracts in the EMEA region.",
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "IN_PROGRESS",
      departmentId: deptSales.id,
    },
  });

  console.log("✅ Department Milestones created");

  // 6. Create Tasks (Demonstrating CEO to HOD, HOD to HOD, and HOD to Employee direct assignments!)
  await db.task.createMany({
    data: [
      {
        title: "CEO Direct Task: Oversee Software Security Audit",
        description: "Task assigned directly by CEO to Software HOD Sarah Chen.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        departmentId: deptSoftware.id,
        createdById: ceo.id,
        assignedToId: hodSoftware.id, // CEO -> HOD task!
        milestoneId: m1.id,
        projectId: projAiPlatform.id,
      },
      {
        title: "HOD Cross-Delegation: Hardware Power Spec Sync",
        description: "Task delegated from Software HOD Sarah Chen to Electronics HOD Marcus Vance.",
        status: "IN_PROGRESS",
        priority: "URGENT",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        departmentId: deptElectronics.id,
        createdById: hodSoftware.id,
        assignedToId: hodElectronics.id, // HOD -> HOD task!
        milestoneId: m2.id,
        projectId: projIotHardware.id,
      },
      {
        title: "Implement Role-Based Access Control (RBAC)",
        description: "Enforce CEO, HOD, and Employee permission checks across API endpoints.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        departmentId: deptSoftware.id,
        createdById: hodSoftware.id,
        assignedToId: empSoftware.id, // HOD -> Employee task!
        milestoneId: m1.id,
        projectId: projInternalHrms.id,
      },
      {
        title: "Explore Zustand / React Query for State",
        description: "Self-initiated spike to compare client state performance.",
        status: "TODO",
        priority: "LOW",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        departmentId: deptSoftware.id,
        createdById: empSoftware.id, // Self-created task!
        assignedToId: empSoftware.id,
        milestoneId: m1.id,
        projectId: projInternalHrms.id,
      },
      {
        title: "Client Pitch Deck Preparation",
        description: "Finalize customized pitch deck for enterprise SaaS demo.",
        status: "COMPLETED",
        priority: "HIGH",
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        departmentId: deptSales.id,
        createdById: hodSales.id,
        assignedToId: empSales.id,
        milestoneId: m3.id,
        projectId: projGlobalSales.id,
      },
    ],
  });

  console.log("✅ Sample Tasks created (CEO-to-HOD, HOD-to-HOD, HOD-to-Employee)");

  // 7. Create Skills & UserSkills
  const s1 = await db.skill.upsert({
    where: { name: "Next.js 16 & Server Actions" },
    update: {},
    create: { name: "Next.js 16 & Server Actions", category: "Software" },
  });

  const s2 = await db.skill.upsert({
    where: { name: "Prisma & PostgreSQL ORM" },
    update: {},
    create: { name: "Prisma & PostgreSQL ORM", category: "Software" },
  });

  const s3 = await db.skill.upsert({
    where: { name: "ARM Cortex Firmware Optimization" },
    update: {},
    create: { name: "ARM Cortex Firmware Optimization", category: "Hardware" },
  });

  const s4 = await db.skill.upsert({
    where: { name: "B2B SaaS Negotiation" },
    update: {},
    create: { name: "B2B SaaS Negotiation", category: "Sales" },
  });

  await db.userSkill.createMany({
    data: [
      {
        userId: empSoftware.id,
        skillId: s1.id,
        proficiency: "LEARNING",
        notes: "Studying App Router and Server Components caching patterns.",
      },
      {
        userId: empSoftware.id,
        skillId: s2.id,
        proficiency: "ADVANCED",
        notes: "Configured Prisma 7 adapter-pg driver.",
      },
      {
        userId: empElectronics.id,
        skillId: s3.id,
        proficiency: "LEARNING",
        notes: "Learning low-power DMA transfers for IoT telemetry.",
      },
      {
        userId: empSales.id,
        skillId: s4.id,
        proficiency: "INTERMEDIATE",
        notes: "Attending enterprise deal structuring workshop.",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Employee Skills & Learning tracks created");

  // 8. Create Hurdles & Q&As
  await db.hurdle.create({
    data: {
      title: "Prisma 7 Driver Adapter setup in Next.js Turbopack",
      question: "Should we use pg.Pool with @prisma/adapter-pg for serverless environment hot-reloading?",
      status: "RESOLVED",
      askedById: empSoftware.id,
      answeredById: hodSoftware.id,
      answer: "Yes! Use pg.Pool wrapped with PrismaPg adapter and globalThis singleton pattern in lib/db.ts.",
    },
  });

  await db.hurdle.create({
    data: {
      title: "Power Spike on Cold Boot for Smart Controller",
      question: "The prototype experiences a 150mA power transient during bootloader execution. Should we add a soft-start capacitor?",
      status: "OPEN",
      askedById: empElectronics.id,
    },
  });

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  });
