import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting GoPerch HRMS database seed with official leadership team...");

  const defaultPasswordHash = await bcrypt.hash("password123", 10);

  // 1. Create 4 Departments
  const deptElectronics = await prisma.department.upsert({
    where: { code: "ELECTRONICS" },
    update: { name: "Electronics", description: "Hardware engineering, PCB design, and embedded firmware development." },
    create: {
      name: "Electronics",
      code: "ELECTRONICS",
      description: "Hardware engineering, PCB design, and embedded firmware development.",
    },
  });

  const deptSoftware = await prisma.department.upsert({
    where: { code: "SOFTWARE" },
    update: { name: "Software", description: "Web & cloud application development, AI infrastructure, and microservices." },
    create: {
      name: "Software",
      code: "SOFTWARE",
      description: "Web & cloud application development, AI infrastructure, and microservices.",
    },
  });

  const deptSales = await prisma.department.upsert({
    where: { code: "SALES" },
    update: { name: "Sales", description: "B2B sales strategy, account management, and market expansion." },
    create: {
      name: "Sales",
      code: "SALES",
      description: "B2B sales strategy, account management, and market expansion.",
    },
  });

  const deptLeadership = await prisma.department.upsert({
    where: { code: "LEADERSHIP" },
    update: { name: "Leadership", description: "Executive management, strategic growth, and cross-functional operations." },
    create: {
      name: "Leadership",
      code: "LEADERSHIP",
      description: "Executive management, strategic growth, and cross-functional operations.",
    },
  });

  console.log("✅ 4 Departments verified (Electronics, Software, Sales, Leadership)");

  // 2. Create CEO, Official HODs & Employees
  const ceo = await prisma.user.upsert({
    where: { email: "ceo@goperch.com" },
    update: { name: "Ryan Bantu (CEO)", role: "CEO", title: "Chief Executive Officer" },
    create: {
      email: "ceo@goperch.com",
      password: defaultPasswordHash,
      name: "Ryan Bantu (CEO)",
      role: "CEO",
      title: "Chief Executive Officer",
      departmentId: deptLeadership.id,
    },
  });

  const hodSoftware = await prisma.user.upsert({
    where: { email: "hod.software@goperch.com" },
    update: { name: "Prasanna (Software HOD)", role: "HOD", title: "Head of Software Engineering" },
    create: {
      email: "hod.software@goperch.com",
      password: defaultPasswordHash,
      name: "Prasanna (Software HOD)",
      role: "HOD",
      title: "Head of Software Engineering",
      departmentId: deptSoftware.id,
    },
  });

  const hodElectronics = await prisma.user.upsert({
    where: { email: "hod.electronics@goperch.com" },
    update: { name: "Vikram (Electronics HOD)", role: "HOD", title: "Head of Electronics & Hardware" },
    create: {
      email: "hod.electronics@goperch.com",
      password: defaultPasswordHash,
      name: "Vikram (Electronics HOD)",
      role: "HOD",
      title: "Head of Electronics & Hardware",
      departmentId: deptElectronics.id,
    },
  });

  const hodSales = await prisma.user.upsert({
    where: { email: "hod.sales@goperch.com" },
    update: { name: "Jonathan Jaladi (Sales HOD)", role: "HOD", title: "Head of Sales & Partnerships" },
    create: {
      email: "hod.sales@goperch.com",
      password: defaultPasswordHash,
      name: "Jonathan Jaladi (Sales HOD)",
      role: "HOD",
      title: "Head of Sales & Partnerships",
      departmentId: deptSales.id,
    },
  });

  // Department Employees
  const empSoftware = await prisma.user.upsert({
    where: { email: "emp.software@goperch.com" },
    update: { name: "Alex Dev (Software Dev)", role: "EMPLOYEE", title: "Fullstack Engineer" },
    create: {
      email: "emp.software@goperch.com",
      password: defaultPasswordHash,
      name: "Alex Dev (Software Dev)",
      role: "EMPLOYEE",
      title: "Fullstack Engineer",
      departmentId: deptSoftware.id,
    },
  });

  const empElectronics = await prisma.user.upsert({
    where: { email: "emp.electronics@goperch.com" },
    update: { name: "Priya Patel (Hardware Eng)", role: "EMPLOYEE", title: "Embedded Systems Specialist" },
    create: {
      email: "emp.electronics@goperch.com",
      password: defaultPasswordHash,
      name: "Priya Patel (Hardware Eng)",
      role: "EMPLOYEE",
      title: "Embedded Systems Specialist",
      departmentId: deptElectronics.id,
    },
  });

  const empSales = await prisma.user.upsert({
    where: { email: "emp.sales@goperch.com" },
    update: { name: "James Wilson (Sales Rep)", role: "EMPLOYEE", title: "Account Executive" },
    create: {
      email: "emp.sales@goperch.com",
      password: defaultPasswordHash,
      name: "James Wilson (Sales Rep)",
      role: "EMPLOYEE",
      title: "Account Executive",
      departmentId: deptSales.id,
    },
  });

  console.log("✅ Core Leadership Team seeded: Ryan Bantu (CEO), Prasanna (Software HOD), Vikram (Electronics HOD), Jonathan Jaladi (Sales HOD)");

  // 3. Clear existing projects/tasks to re-seed cleanly
  await prisma.taskComment.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.projectNote.deleteMany({});
  await prisma.hurdle.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.message.deleteMany({});

  // 4. Create Projects (including CEO Top 3 Strategic Focus)
  const projAiPlatform = await prisma.project.create({
    data: {
      title: "GoPerch Enterprise AI Platform",
      description: "Deploy next-gen AI workforce telemetry and intelligent decision assistance across all customer organizations.",
      status: "IN_PROGRESS",
      progress: 75,
      isTopFocus: true, // CEO Top Priority #1
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      departmentId: deptSoftware.id,
      createdById: ceo.id,
    },
  });

  const projIotHardware = await prisma.project.create({
    data: {
      title: "Smart Controller Chip V2",
      description: "Next-gen embedded sensor hub with ultra-low power consumption and real-time mesh connectivity.",
      status: "IN_PROGRESS",
      progress: 55,
      isTopFocus: true, // CEO Top Priority #2
      targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      departmentId: deptElectronics.id,
      createdById: ceo.id,
    },
  });

  const projGlobalSales = await prisma.project.create({
    data: {
      title: "EMEA Enterprise Revenue Expansion",
      description: "Scaling B2B sales pipelines across European tech hubs with targeted direct account executive outreach.",
      status: "IN_PROGRESS",
      progress: 85,
      isTopFocus: true, // CEO Top Priority #3
      targetDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      departmentId: deptSales.id,
      createdById: ceo.id,
    },
  });

  const projInternalHrms = await prisma.project.create({
    data: {
      title: "Internal HRMS 2.0 Operations Revamp",
      description: "Upgrading core UI/UX with Next.js 16, visual project management, and real-time executive dashboard.",
      status: "IN_PROGRESS",
      progress: 92,
      isTopFocus: false,
      departmentId: deptSoftware.id,
      createdById: hodSoftware.id,
    },
  });

  const projElectronicsTelemetry = await prisma.project.create({
    data: {
      title: "High-Speed PCB Telemetry Module",
      description: "Designing high-frequency signal integrity telemetry board for industrial sensor clusters.",
      status: "IN_PROGRESS",
      progress: 40,
      isTopFocus: false,
      departmentId: deptElectronics.id,
      createdById: hodElectronics.id,
    },
  });

  const projSalesPartnerships = await prisma.project.create({
    data: {
      title: "Q4 Global Strategic Partner Network",
      description: "Establishing reseller alliances and cloud ecosystem integrations to accelerate enterprise ARR.",
      status: "IN_PROGRESS",
      progress: 60,
      isTopFocus: false,
      departmentId: deptSales.id,
      createdById: hodSales.id,
    },
  });

  // Project Notes (Execution Feed)
  await prisma.projectNote.createMany({
    data: [
      {
        content: "API endpoint latency reduced by 40% after implementing Prisma 7 connection pooling.",
        authorId: hodSoftware.id,
        projectId: projAiPlatform.id,
      },
      {
        content: "CEO Ryan Bantu requested live progress bar on executive view. Next.js App Router streaming enabled.",
        authorId: empSoftware.id,
        projectId: projAiPlatform.id,
      },
      {
        content: "PCB layer stackup finalized by Vikram & Priya. Power regulator transient spike solved.",
        authorId: hodElectronics.id,
        projectId: projIotHardware.id,
      },
      {
        content: "Jonathan Jaladi led initial deal terms review for Tier-1 enterprise leads in London and Frankfurt.",
        authorId: hodSales.id,
        projectId: projGlobalSales.id,
      },
      {
        content: "High-contrast visual design and dynamic role scoping shipped across all departments.",
        authorId: hodSoftware.id,
        projectId: projInternalHrms.id,
      },
    ],
  });

  console.log("✅ 6 Core Projects & Execution Notes created");

  // 5. Create Default Chat Channels
  const chGeneral = await prisma.channel.upsert({
    where: { name: "general" },
    update: {},
    create: {
      name: "general",
      description: "Company-wide general announcements and casual chat.",
    },
  });

  const chSoftware = await prisma.channel.upsert({
    where: { name: "software-team" },
    update: {},
    create: {
      name: "software-team",
      description: "Software engineering discussion & release updates.",
      departmentId: deptSoftware.id,
    },
  });

  const chElectronics = await prisma.channel.upsert({
    where: { name: "electronics-team" },
    update: {},
    create: {
      name: "electronics-team",
      description: "Hardware prototypes, PCB design, and telemetry updates.",
      departmentId: deptElectronics.id,
    },
  });

  const chSales = await prisma.channel.upsert({
    where: { name: "sales-team" },
    update: {},
    create: {
      name: "sales-team",
      description: "B2B client deals and regional market expansion strategy.",
      departmentId: deptSales.id,
    },
  });

  const chLeadership = await prisma.channel.upsert({
    where: { name: "leadership-exec" },
    update: {},
    create: {
      name: "leadership-exec",
      description: "Executive strategy channel for CEO Ryan Bantu & HODs.",
      departmentId: deptLeadership.id,
    },
  });

  console.log("✅ Chat Channels created (#general, #software-team, #electronics-team, #sales-team, #leadership-exec)");

  // 6. Seed Initial Messages
  await prisma.message.createMany({
    data: [
      {
        content: "Welcome everyone to the GoPerch HRMS operating system! Excited to drive our Q4 goals.",
        senderId: ceo.id,
        channelId: chGeneral.id,
      },
      {
        content: "Software team: Next.js 16 and Prisma 7 setup is live. Prasanna & Alex overseeing production deployment.",
        senderId: hodSoftware.id,
        channelId: chSoftware.id,
      },
      {
        content: "Electronics team: Vikram & Priya have greenlit the v2 smart controller PCB fabrication.",
        senderId: hodElectronics.id,
        channelId: chElectronics.id,
      },
      {
        content: "Sales team: Jonathan Jaladi & James Wilson closed 2 enterprise pilots this morning!",
        senderId: hodSales.id,
        channelId: chSales.id,
      },
      {
        content: "Hi Prasanna, great progress on the Next.js launch! Let's align on the Q4 roadmap tomorrow.",
        senderId: ceo.id,
        recipientId: hodSoftware.id,
      },
      {
        content: "Hi Ryan, Jonathan and Vikram have completed their cross-department specs. Ready for executive review.",
        senderId: hodSoftware.id,
        recipientId: ceo.id,
      },
    ],
  });

  console.log("✅ Initial Messages & DMs created with official leadership names");

  // 7. Create Milestones
  const m1 = await prisma.milestone.create({
    data: {
      title: "Q3 HRMS Next.js App Launch",
      description: "Deliver full-stack Next.js 16 app with PostgreSQL database integration.",
      targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "IN_PROGRESS",
      departmentId: deptSoftware.id,
    },
  });

  const m2 = await prisma.milestone.create({
    data: {
      title: "IoT Controller Prototype v2",
      description: "Fabricate and test 4-layer PCB prototype for smart sensor telemetry.",
      targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: "IN_PROGRESS",
      departmentId: deptElectronics.id,
    },
  });

  const m3 = await prisma.milestone.create({
    data: {
      title: "Q3 Enterprise Expansion",
      description: "Close 5 major enterprise contracts in the EMEA region.",
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "IN_PROGRESS",
      departmentId: deptSales.id,
    },
  });

  // 8. Create Tasks & Kanban Tickets
  const t1 = await prisma.task.create({
    data: {
      title: "CEO Direct Task: Oversee Software Security Audit",
      description: "Task assigned directly by CEO Ryan Bantu to Software HOD Prasanna.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      departmentId: deptSoftware.id,
      createdById: ceo.id,
      assignedToId: hodSoftware.id,
      milestoneId: m1.id,
      projectId: projAiPlatform.id,
    },
  });

  const t2 = await prisma.task.create({
    data: {
      title: "HOD Cross-Delegation: Hardware Power Spec Sync",
      description: "Task delegated from Software HOD Prasanna to Electronics HOD Vikram.",
      status: "IN_REVIEW",
      priority: "URGENT",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      departmentId: deptElectronics.id,
      createdById: hodSoftware.id,
      assignedToId: hodElectronics.id,
      milestoneId: m2.id,
      projectId: projIotHardware.id,
    },
  });

  const t3 = await prisma.task.create({
    data: {
      title: "Sales & Software Joint Demo Setup",
      description: "Task assigned by Sales HOD Jonathan Jaladi to Software HOD Prasanna.",
      status: "TODO",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      departmentId: deptSoftware.id,
      createdById: hodSales.id,
      assignedToId: hodSoftware.id,
      milestoneId: m1.id,
      projectId: projGlobalSales.id,
    },
  });

  const t4 = await prisma.task.create({
    data: {
      title: "Implement Role-Based Access Control (RBAC)",
      description: "Enforce CEO, HOD, and Employee permission checks across API endpoints.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      departmentId: deptSoftware.id,
      createdById: hodSoftware.id,
      assignedToId: empSoftware.id,
      milestoneId: m1.id,
      projectId: projInternalHrms.id,
    },
  });

  const t5 = await prisma.task.create({
    data: {
      title: "Smart Controller Micro-Code Verification",
      description: "Priya Patel to verify hardware interrupt routine for real-time telemetry.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      departmentId: deptElectronics.id,
      createdById: hodElectronics.id,
      assignedToId: empElectronics.id,
      milestoneId: m2.id,
      projectId: projIotHardware.id,
    },
  });

  const t6 = await prisma.task.create({
    data: {
      title: "EMEA Pitch Deck & Pricing Review",
      description: "James Wilson to prepare customized pricing proposals for enterprise prospects.",
      status: "COMPLETED",
      priority: "HIGH",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      departmentId: deptSales.id,
      createdById: hodSales.id,
      assignedToId: empSales.id,
      milestoneId: m3.id,
      projectId: projGlobalSales.id,
    },
  });

  console.log("✅ Sample Tasks created for Ryan Bantu, Prasanna, Vikram, Jonathan Jaladi, Alex, Priya, and James");

  // Seed Task Comments
  await prisma.taskComment.createMany({
    data: [
      {
        content: "I have initialized the security audit sweep. OWASP compliance checks are 60% completed.",
        taskId: t1.id,
        authorId: hodSoftware.id,
      },
      {
        content: "Excellent progress Prasanna. Make sure the API rate-limiting endpoints are verified.",
        taskId: t1.id,
        authorId: ceo.id,
      },
      {
        content: "Priya and I completed the voltage transient simulation. Moved to IN_REVIEW for final sign-off.",
        taskId: t2.id,
        authorId: hodElectronics.id,
      },
      {
        content: "Alex Dev: JWT middleware and route guards are deployed to staging.",
        taskId: t4.id,
        authorId: empSoftware.id,
      },
      {
        content: "Pricing slides and ROI model submitted to Jonathan Jaladi. Deal ready for closing.",
        taskId: t6.id,
        authorId: empSales.id,
      },
    ],
  });

  // Seed Manager Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: ceo.id,
        title: "Task Status Updated",
        message: "Prasanna moved 'CEO Direct Task: Oversee Software Security Audit' to IN_PROGRESS.",
        isRead: false,
        link: "#tasks",
      },
      {
        userId: hodSoftware.id,
        title: "New Ticket Comment",
        message: "Alex Dev commented on 'Implement Role-Based Access Control (RBAC)': JWT middleware deployed.",
        isRead: false,
        link: "#tasks",
      },
      {
        userId: hodSales.id,
        title: "Ticket Completed",
        message: "James Wilson marked 'EMEA Pitch Deck & Pricing Review' as COMPLETED.",
        isRead: true,
        link: "#tasks",
      },
    ],
  });

  console.log("✅ Task Comments & Manager Notifications seeded");

  // 9. Create Skills & UserSkills
  const s1 = await prisma.skill.upsert({
    where: { name: "Next.js 16 & Server Actions" },
    update: {},
    create: { name: "Next.js 16 & Server Actions", category: "Software" },
  });

  const s2 = await prisma.skill.upsert({
    where: { name: "Prisma & PostgreSQL ORM" },
    update: {},
    create: { name: "Prisma & PostgreSQL ORM", category: "Software" },
  });

  const s3 = await prisma.skill.upsert({
    where: { name: "ARM Cortex Firmware Optimization" },
    update: {},
    create: { name: "ARM Cortex Firmware Optimization", category: "Hardware" },
  });

  const s4 = await prisma.skill.upsert({
    where: { name: "B2B SaaS Negotiation" },
    update: {},
    create: { name: "B2B SaaS Negotiation", category: "Sales" },
  });

  await prisma.userSkill.deleteMany({});
  await prisma.userSkill.createMany({
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
  });

  console.log("✅ Employee Skills & Learning tracks created");

  // 10. Create Hurdles & Q&As
  await prisma.hurdle.create({
    data: {
      title: "Prisma 7 Driver Adapter setup in Next.js Turbopack",
      question: "Should we use pg.Pool with @prisma/adapter-pg for serverless environment hot-reloading?",
      status: "RESOLVED",
      askedById: empSoftware.id,
      answeredById: hodSoftware.id,
      answer: "Yes! Use pg.Pool wrapped with PrismaPg adapter and globalThis singleton pattern in lib/db.ts.",
    },
  });

  await prisma.hurdle.create({
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
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
