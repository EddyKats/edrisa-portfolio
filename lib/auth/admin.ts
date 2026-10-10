export const studioAdmin = {
  githubLogin: "EddyKats",
  githubId: "176062412",
} as const;

export function isStudioAdmin(identity: { githubLogin?: string | null; githubId?: string | null } | null | undefined) {
  if (!identity?.githubLogin || !identity.githubId) return false;
  return identity.githubLogin === studioAdmin.githubLogin && identity.githubId === studioAdmin.githubId;
}
