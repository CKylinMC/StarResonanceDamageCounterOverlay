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
    // 新增治疗相关字段
    realtime_hps: number;
    realtime_hps_max: number;
    total_hps: number;
    total_healing: {
        normal: number;
        critical: number;
        lucky: number;
        crit_lucky: number;
        hpLessen: number; // 治疗固定为0
        total: number;
    };
    // 新增承受伤害和职业字段
    taken_damage: number;
    profession: string;
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
