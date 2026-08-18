interface listInterface {
    userId: string
}

export interface userInterface {
    userId: string,
    group: string[]
}

export type FeatureFlagRules = {
    blacklist?: listInterface[],
    whitelist?: listInterface[],
    groups?: string[],
}

export interface flagRuleInterface {
    blacklist?: listInterface[],
    whitelist?: listInterface[],
    groups?: string[],
    rollout?: number 
}
