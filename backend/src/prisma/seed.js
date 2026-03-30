const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const users = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
    tags: ['javascript', 'react', 'frontend', 'web development'],
    description: 'Frontend developer with 3 years experience in React and modern web technologies. Looking for guidance on transitioning to a full-stack role.',
  },
  {
    name: 'Bob Martinez',
    email: 'bob@example.com',
    password: 'password123',
    tags: ['python', 'data science', 'machine learning', 'ai'],
    description: 'Data scientist passionate about ML and AI. Seeking mentorship in deploying ML models to production environments.',
  },
  {
    name: 'Carol Smith',
    email: 'carol@example.com',
    password: 'password123',
    tags: ['java', 'spring boot', 'backend', 'microservices'],
    description: 'Backend Java developer looking to understand system design and improve interview skills for tier-1 companies.',
  },
  {
    name: 'David Lee',
    email: 'david@example.com',
    password: 'password123',
    tags: ['devops', 'kubernetes', 'docker', 'cloud'],
    description: 'DevOps engineer interested in cloud architecture at scale. Wants resume help to target big tech companies.',
  },
  {
    name: 'Emma Wilson',
    email: 'emma@example.com',
    password: 'password123',
    tags: ['product management', 'agile', 'communication', 'leadership'],
    description: 'Aspiring product manager with engineering background. Looking for guidance on job market and transitioning into PM roles.',
  },
  {
    name: 'Frank Chen',
    email: 'frank@example.com',
    password: 'password123',
    tags: ['ios', 'swift', 'mobile development', 'xcode'],
    description: 'Self-taught iOS developer with 2 apps on App Store. Needs mock interview preparation for mobile engineering roles.',
  },
  {
    name: 'Grace Kim',
    email: 'grace@example.com',
    password: 'password123',
    tags: ['android', 'kotlin', 'mobile development', 'java'],
    description: 'Android developer looking to improve DSA skills and crack product-based company interviews.',
  },
  {
    name: 'Henry Brown',
    email: 'henry@example.com',
    password: 'password123',
    tags: ['cybersecurity', 'networking', 'linux', 'penetration testing'],
    description: 'Security analyst seeking career transition into big tech security teams. Needs resume revamp and mock interview coaching.',
  },
  {
    name: 'Isabella Davis',
    email: 'isabella@example.com',
    password: 'password123',
    tags: ['ui/ux', 'figma', 'design systems', 'user research'],
    description: 'UX designer moving into product design. Looking for job market insights and how to present portfolio to tech companies.',
  },
  {
    name: 'James Thompson',
    email: 'james@example.com',
    password: 'password123',
    tags: ['golang', 'distributed systems', 'backend', 'algorithms'],
    description: 'Backend engineer specializing in distributed systems. Wants to target FAANG companies and needs comprehensive interview prep.',
  },
];

const mentors = [
  {
    name: 'Dr. Sarah Goldman',
    email: 'sarah.mentor@example.com',
    password: 'mentor123',
    tags: ['google', 'big tech', 'system design', 'algorithms', 'leadership', 'resume'],
    description: 'Senior Staff Engineer at Google with 12 years experience. Expert in system design, distributed computing, and technical leadership. Former interviewer at Google and Amazon.',
  },
  {
    name: 'Michael Zhang',
    email: 'michael.mentor@example.com',
    password: 'mentor123',
    tags: ['communication', 'product management', 'career coaching', 'job market', 'leadership', 'agile'],
    description: 'Career coach and former PM at LinkedIn with exceptional communication skills. Specialist in job market navigation, interview communication, and career pivots. Helped 200+ professionals land their dream jobs.',
  },
  {
    name: 'Priya Sharma',
    email: 'priya.mentor@example.com',
    password: 'mentor123',
    tags: ['microsoft', 'big tech', 'frontend', 'react', 'javascript', 'resume', 'web development'],
    description: 'Principal Engineer at Microsoft with expertise in frontend architecture. 10 years in big tech, passionate about helping developers level up their careers with strong resumes and technical skills.',
  },
  {
    name: 'Carlos Rivera',
    email: 'carlos.mentor@example.com',
    password: 'mentor123',
    tags: ['data science', 'machine learning', 'python', 'ai', 'mock interviews', 'algorithms'],
    description: 'ML Engineer at Netflix with deep domain expertise in recommendation systems and NLP. Loves conducting mock interviews and helping candidates master ML system design.',
  },
  {
    name: 'Jennifer Park',
    email: 'jennifer.mentor@example.com',
    password: 'mentor123',
    tags: ['amazon', 'big tech', 'devops', 'cloud', 'aws', 'communication', 'backend', 'microservices'],
    description: 'Principal SDE at Amazon AWS with 15 years experience. Expert in cloud architecture, backend systems, and DevOps. Known for clear explanations and helping candidates understand the big picture of tech careers.',
  },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.user.deleteMany();
  await prisma.mentor.deleteMany();
  await prisma.admin.deleteMany();

  console.log('✅ Cleared existing data');

  // Seed Admin
  const hashedAdminPass = await bcrypt.hash('admin123', 10);
  await prisma.admin.create({
    data: {
      email: 'admin@example.com',
      password: hashedAdminPass,
    },
  });
  console.log('✅ Admin created: admin@example.com / admin123');

  // Seed Users
  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashed,
        tags: user.tags,
        description: user.description,
      },
    });
  }
  console.log(`✅ ${users.length} Users created`);

  // Seed Mentors
  for (const mentor of mentors) {
    const hashed = await bcrypt.hash(mentor.password, 10);
    await prisma.mentor.create({
      data: {
        name: mentor.name,
        email: mentor.email,
        password: hashed,
        tags: mentor.tags,
        description: mentor.description,
      },
    });
  }
  console.log(`✅ ${mentors.length} Mentors created`);

  // Seed sample availabilities
  const allUsers = await prisma.user.findMany();
  const allMentors = await prisma.mentor.findMany();

  const dates = ['2026-04-01', '2026-04-02', '2026-04-03', '2026-04-04', '2026-04-05'];
  const slots = [
    { startTime: '09:00', endTime: '10:00' },
    { startTime: '10:00', endTime: '11:00' },
    { startTime: '14:00', endTime: '15:00' },
    { startTime: '15:00', endTime: '16:00' },
    { startTime: '16:00', endTime: '17:00' },
  ];

  for (const user of allUsers.slice(0, 5)) {
    const date = dates[Math.floor(Math.random() * dates.length)];
    const slot = slots[Math.floor(Math.random() * slots.length)];
    await prisma.availability.create({
      data: { userId: user.id, date, startTime: slot.startTime, endTime: slot.endTime },
    });
  }

  for (const mentor of allMentors) {
    for (const date of dates.slice(0, 3)) {
      const slot = slots[Math.floor(Math.random() * slots.length)];
      await prisma.availability.create({
        data: { mentorId: mentor.id, date, startTime: slot.startTime, endTime: slot.endTime },
      });
    }
  }

  console.log('✅ Sample availabilities created');
  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   Users: alice@example.com / password123 (and others)');
  console.log('   Mentors: sarah.mentor@example.com / mentor123 (and others)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
