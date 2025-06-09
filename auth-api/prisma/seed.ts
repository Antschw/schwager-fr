import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'ChangeMe123!';

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        const hashedPassword = await argon2.hash(adminPassword);
        await prisma.user.create({
            data: {
                email: adminEmail,
                firstName: 'Admin',
                lastName: 'User',
                password: hashedPassword,
                role: Role.ADMIN,
            },
        });
        console.log('Admin user created with default password. CHANGE IT IMMEDIATELY!');
    } else {
        console.log('Admin user already exists.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
