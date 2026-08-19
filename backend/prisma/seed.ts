import dotenv from "dotenv"
import bcrypt from "bcrypt"; 
import db, { ENVIRONMENT_TYPE, Method, ROLES, USER_STATUS } from "../utils/db/db";

dotenv.config();

const API_PREFIX = "/api/v1";

async function main() {
    console.log("Clearing existing data...");
    await db.feature_Flag_Audit.deleteMany();
    await db.routeFlag.deleteMany();
    await db.feature_Flag.deleteMany();
    await db.contentAudit.deleteMany();
    await db.content.deleteMany();
    await db.groupMember.deleteMany();
    await db.group.deleteMany();
    await db.jWT_Token.deleteMany();
    await db.otp.deleteMany();
    await db.user.deleteMany();

    console.log("Seeding users...");
    const hashedPassword = await bcrypt.hash("Password123!", 10);

    const userSeeds = Array.from({ length: 10 }, (_, i) => ({
        username: `user${i + 1}`,
        email: `user${i + 1}@email.com`,
        password: hashedPassword,
        role: i === 0 ? ROLES.ADMIN : ROLES.USER, // user1 is the admin
        user_status: USER_STATUS.ACTIVE,
    }));

    const users = [];
    for (const u of userSeeds) {
        const created = await db.user.create({ data: u });
        users.push(created);
    }
    const admin = users[0];
    if (!admin) {
        throw new Error("No admin available for route flag seeding");
    }
    console.log(`Created ${users.length} users (admin: ${admin.email})`);

    // ---------- GROUPS ----------
    console.log("Seeding groups...");
    const groupNames = ["beta-testers", "internal-staff", "power-users"];
    const groups = [];
    for (const name of groupNames) {
        const group = await db.group.create({
            data: {
                name,
                total_users: 0, 
                userId: admin.id,
            },
        });
        groups.push(group);
    }

    // distribute all 10 users across 3 groups round-robin (some users end up in multiple? no — one each here)
    console.log("Adding members to groups...");
    for (let i = 0; i < users.length; i++) {
        const group = groups[i % groups.length];
        if (!group) {
            throw new Error("No group available for route flag seeding");
        }
        await db.groupMember.create({
            data: {
                userId: users[i]!.id,
                groupId: group.id,
            },
        });
    }

    // update total_users count per group
    for (const group of groups) {
        const count = await db.groupMember.count({ where: { groupId: group.id } });
        await db.group.update({
            where: { id: group.id },
            data: { total_users: count },
        });
    }
    console.log(`Created ${groups.length} groups with members distributed`);

    // ---------- FEATURE FLAGS ----------
    console.log("Seeding feature flags...");
    const flagSeeds = [
        {
            name: "new-toggle-ui",
            is_enabled: true,
            environment: ENVIRONMENT_TYPE.PRODUCTION,
            rollout: 100,
            rules: {},
        },
        {
            name: "beta-content-editor",
            is_enabled: true,
            environment: ENVIRONMENT_TYPE.DEVELOPMENT,
            rollout: 50,
            rules: {
                whitelist: [{ userId: users[1]!.id }, { userId: users[2]!.id }],
            },
        },
        {
            name: "group-management-v2",
            is_enabled: true,
            environment: ENVIRONMENT_TYPE.PRODUCTION,
            rollout: 100,
            rules: {
                groups: [groups[0]!.name, groups[1]!.name],
            },
        },
        {
            name: "experimental-analytics",
            is_enabled: false,
            environment: ENVIRONMENT_TYPE.DEVELOPMENT,
            rollout: 0,
            rules: {},
        },
        {
            name: "restricted-admin-panel",
            is_enabled: true,
            environment: ENVIRONMENT_TYPE.PRODUCTION,
            rollout: 100,
            rules: {
                blacklist: [{ userId: users[9]!.id }],
            },
        },
    ];

    const flags = [];
    for (const f of flagSeeds) {
        const flag = await db.feature_Flag.create({ data: f });
        flags.push(flag);
    }
    console.log(`Created ${flags.length} feature flags`);

    // ---------- ROUTE FLAGS ----------
    // Full paths as seen by featureFlagMiddleware — includes API_PREFIX,
    // since the middleware runs in index.ts BEFORE router.use("/api/v1", router) strips anything.
    console.log("Seeding route flags...");

    const routes: { method: Method; path: string }[] = [
        // userRouter -> mounted at /user
        { method: Method.GET, path: "/user/data" },
        { method: Method.POST, path: "/user/signup" },
        { method: Method.POST, path: "/user/login" },
        { method: Method.PATCH, path: "/user/otp-verification" },
        { method: Method.PATCH, path: "/user/forget-password/:email" },
        { method: Method.PATCH, path: "/user/forget-password/:link" },
        { method: Method.PATCH, path: "/user/:email" },

        // contentRouter -> mounted at /content
        { method: Method.GET, path: "/content/" },
        { method: Method.POST, path: "/content/submit" },
        { method: Method.DELETE, path: "/content/:contentId" },

        // contentAuditRouter -> mounted at /content/audit
        { method: Method.GET, path: "/content/audit/:contentId" },

        // routerFlagRouter -> mounted at /router
        { method: Method.POST, path: "/router/add" },
        { method: Method.POST, path: "/router/change" },
        { method: Method.DELETE, path: "/router/remove" },

        // groupRouter -> mounted at /group
        { method: Method.GET, path: "/group/" },
        { method: Method.POST, path: "/group/create" },
        { method: Method.PATCH, path: "/group/add/:groupId" },
        { method: Method.PATCH, path: "/group/change/:groupId" },
        { method: Method.PATCH, path: "/group/remove/:groupId" },

        // featureFlagRouter -> mounted at /feature
        { method: Method.GET, path: "/feature/" },
        { method: Method.GET, path: "/feature/filter" },
        { method: Method.GET, path: "/feature/details/:flagId" },
        { method: Method.POST, path: "/feature/new" },
        { method: Method.PATCH, path: "/feature/toggle" },
        { method: Method.PATCH, path: "/feature/evaluate/:flagId/:userId" },
        { method: Method.PATCH, path: "/feature/whitelist/:flagId/:userId" },
        { method: Method.PATCH, path: "/feature/blacklist/:flagId/:userId" },
        { method: Method.PATCH, path: "/feature/group/:flagId/:groupId" },
        { method: Method.PATCH, path: "/feature/change/:flagId" },
        { method: Method.DELETE, path: "/feature/:flagId" },

        // featureFlagAuditRouter -> mounted at /feature/audit
        { method: Method.GET, path: "/feature/audit/:contentId" },
    ];

    let flagIndex = 0;
    for (const route of routes) {
        const flag = flags[flagIndex % flags.length];
        if (!flag) {
            throw new Error("No feature flags available for route flag seeding");
        }
        await db.routeFlag.create({
            data: {
                method: route.method,
                path: `${API_PREFIX}${route.path}`,
                flagName: flag.name,
            },
        });
        flagIndex++;
    }
    console.log(`Created ${routes.length} route flags under prefix "${API_PREFIX}"`);

    console.log("Seeding complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });