import db, { ROLES } from "../../utils/db/db";

interface FlagRules {
  whitelist?: Array<{ userId: string; group?: string[] }>;
  blacklist?: Array<{ userId: string; group?: string[] }>;
  groups?: string[];
  rollout?: number;
}

const canUserSeeFlag = (rules: FlagRules, userId: string, userGroupIds: string[]): boolean => {
  const isBlacklisted = rules.blacklist?.some((b) => b.userId === userId);
  if (isBlacklisted) return false;

  const isWhitelisted = rules.whitelist?.some((w) => w.userId === userId);
  if (isWhitelisted) return true;

  const isInAllowedGroup = rules.groups?.some((g) => userGroupIds.includes(g));
  if (isInAllowedGroup) return true;

  if ((rules.rollout ?? 0) >= 100) return true;

  return false;
};

export const getFlagService = async (role: ROLES, userId: string) => {
  const findAllFlags = await db.feature_Flag.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      name: true,
      is_enabled: true,
      isDeleted: true,
      environment: true,
      rules: true,
      rollout: true,
      createdAt: true,
      updatedAt: true,
      routes: {
        select: { id: true, method: true, path: true },
      },
    },
    orderBy: { name: "asc" },
  });

  if (role === "ADMIN") {
    return {
      errorCode: 200,
      success: true,
      message: "All the flags were successfully fetched",
      data: findAllFlags,
    };
  }

  const memberships = await db.groupMember.findMany({
    where: { userId },
    select: { groupId: true },
  });
  const userGroupIds = memberships.map((m) => m.groupId);

  const visibleFlags = findAllFlags.filter((flag) => {
    const rules = (flag.rules as FlagRules) ?? {};
    return canUserSeeFlag(rules, userId, userGroupIds);
  });

  return {
    errorCode: 200,
    success: true,
    message: "Flags were successfully fetched",
    data: visibleFlags,
  };
};

export default getFlagService;