export type DPSItem = {
    realtime_dps: number;
    realtime_dps_max: number;
    total_dps: number;
    total_damage: {
        normal: number;
        critical: number;
        lucky: number;
        crit_lucky: number;
        hpLessen: number;
        total: number;
    };
    total_count: {
        normal: number;
        critical: number;
        lucky: number;
        total: number;
    };
}

export type DPSBysUid = {
    [uid: string]: DPSItem;
}

export type DPSResponse = {
    code: 0;
    user: DPSBysUid;
}

export type ClearResponse = {
    code: 0;
    msg: string;
}
