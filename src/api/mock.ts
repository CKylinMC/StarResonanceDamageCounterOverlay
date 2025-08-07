import { DPSResponse, ClearResponse, DPSBysUid, DPSItem } from '../types/data';

// 模拟玩家UID列表
const MOCK_UIDS = [
    '123456789012345678',
    '234567890123456789', 
    '345678901234567890',
    '456789012345678901',
    '567890123456789012',
    '678901234567890123',
    '789012345678901234',
    '890123456789012345',
    '901234567890123456',
    '012345678901234567',
    '112233445566778899',
    '223344556677889900',
    '334455667788990011',
    '445566778899001122',
    '556677889900112233',
    '667788990011223344',
    '778899001122334455',
    '889900112233445566',
    '990011223344556677',
    '001122334455667788'
];

// 生成随机数值
const randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomFloat = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
};

// 生成随机伤害数据
const generateRandomDamageData = (): DPSItem => {
    const normalDamage = randomInt(50000, 200000);
    const criticalDamage = randomInt(80000, 400000);
    const luckyDamage = randomInt(30000, 150000);
    const critLuckyDamage = randomInt(100000, 500000);
    const hpLessenDamage = randomInt(0, 50000);
    
    const normalCount = randomInt(50, 200);
    const criticalCount = randomInt(20, 80);
    const luckyCount = randomInt(10, 50);
    
    const totalDamage = normalDamage + criticalDamage + luckyDamage + critLuckyDamage;
    const totalCount = normalCount + criticalCount + luckyCount;
    
    const realtimeDps = randomFloat(1000, 15000);
    const realtimeDpsMax = realtimeDps * randomFloat(1.2, 2.5);
    
    // 总DPS基于总伤害计算（假设战斗时间为随机秒数）
    const fightDuration = randomInt(30, 300); // 30秒到5分钟
    const totalDps = totalDamage / fightDuration;
    
    // 生成治疗数据
    const normalHealing = randomInt(20000, 100000);
    const criticalHealing = randomInt(30000, 150000);
    const luckyHealing = randomInt(10000, 50000);
    const critLuckyHealing = randomInt(40000, 200000);
    const totalHealing = normalHealing + criticalHealing + luckyHealing + critLuckyHealing;
    
    const realtimeHps = randomFloat(500, 8000);
    const realtimeHpsMax = realtimeHps * randomFloat(1.2, 2.5);
    const totalHps = totalHealing / fightDuration;
    
    // 随机职业
    const professions = ['射线', '冰矛', '居合', '月刃', '空枪', '重装', '鹰弓', '狼弓', '防盾', '光盾', '岩盾', '格挡', '协奏', '狂音', '愈合', '惩戒'];
    const profession = professions[randomInt(0, professions.length - 1)];
    
    return {
        realtime_dps: realtimeDps,
        realtime_dps_max: realtimeDpsMax,
        total_dps: totalDps,
        total_damage: {
            normal: normalDamage,
            critical: criticalDamage,
            lucky: luckyDamage,
            crit_lucky: critLuckyDamage,
            hpLessen: hpLessenDamage,
            total: totalDamage
        },
        total_count: {
            normal: normalCount,
            critical: criticalCount,
            lucky: luckyCount,
            total: totalCount
        },
        realtime_hps: realtimeHps,
        realtime_hps_max: realtimeHpsMax,
        total_hps: totalHps,
        total_healing: {
            normal: normalHealing,
            critical: criticalHealing,
            lucky: luckyHealing,
            crit_lucky: critLuckyHealing,
            hpLessen: 0, // 治疗不减血
            total: totalHealing
        },
        taken_damage: randomInt(0, 10000),
        profession: profession
    };
};

// 存储当前模拟数据
let mockData: DPSBysUid = {};

// 初始化模拟数据
const initializeMockData = (): void => {
    mockData = {};
    // 随机选择2-4个玩家
    const playerCount = randomInt(2, 4);
    const selectedUids = MOCK_UIDS.slice(0, playerCount);
    
    selectedUids.forEach(uid => {
        mockData[uid] = generateRandomDamageData();
    });
};

// 更新模拟数据（模拟实时变化）
const updateMockData = (): void => {
    Object.keys(mockData).forEach(uid => {
        const currentData = mockData[uid];
        
        // 模拟伤害增长
        const damageIncrease = randomInt(1000, 5000);
        const critIncrease = randomInt(500, 3000);
        const luckyIncrease = randomInt(200, 1500);
        
        // 更新总伤害
        currentData.total_damage.normal += randomInt(0, damageIncrease);
        currentData.total_damage.critical += randomInt(0, critIncrease);
        currentData.total_damage.lucky += randomInt(0, luckyIncrease);
        currentData.total_damage.total = 
            currentData.total_damage.normal + 
            currentData.total_damage.critical + 
            currentData.total_damage.lucky + 
            currentData.total_damage.crit_lucky;
        
        // 更新计数
        currentData.total_count.normal += randomInt(0, 3);
        currentData.total_count.critical += randomInt(0, 2);
        currentData.total_count.lucky += randomInt(0, 1);
        currentData.total_count.total = 
            currentData.total_count.normal + 
            currentData.total_count.critical + 
            currentData.total_count.lucky;
        
        // 更新实时DPS（模拟波动）
        const dpsVariation = randomFloat(0.8, 1.2);
        currentData.realtime_dps = Math.max(0, currentData.realtime_dps * dpsVariation);
        
        // 更新最大DPS
        if (currentData.realtime_dps > currentData.realtime_dps_max) {
            currentData.realtime_dps_max = currentData.realtime_dps;
        }
        
        // 重新计算总DPS
        currentData.total_dps = currentData.total_damage.total / 60; // 每秒伤害
        
        // 模拟治疗增长
        const healingIncrease = randomInt(500, 2000);
        const healingCritIncrease = randomInt(300, 1500);
        const healingLuckyIncrease = randomInt(100, 800);
        
        // 更新治疗数据
        currentData.total_healing.normal += randomInt(0, healingIncrease);
        currentData.total_healing.critical += randomInt(0, healingCritIncrease);
        currentData.total_healing.lucky += randomInt(0, healingLuckyIncrease);
        currentData.total_healing.total = 
            currentData.total_healing.normal + 
            currentData.total_healing.critical + 
            currentData.total_healing.lucky + 
            currentData.total_healing.crit_lucky;
        
        // 更新实时HPS（模拟波动）
        const hpsVariation = randomFloat(0.7, 1.3);
        currentData.realtime_hps = Math.max(0, currentData.realtime_hps * hpsVariation);
        
        // 更新最大HPS
        if (currentData.realtime_hps > currentData.realtime_hps_max) {
            currentData.realtime_hps_max = currentData.realtime_hps;
        }
        
        // 重新计算总HPS
        currentData.total_hps = currentData.total_healing.total / 60;
        
        // 更新承受伤害
        currentData.taken_damage += randomInt(0, 500);
    });
};

// 初始化数据
initializeMockData();

// 每200ms更新一次数据以模拟实时变化
setInterval(updateMockData, 200);

// 模拟获取数据API
export const getMockData = (): Promise<DPSResponse> => {
    return new Promise((resolve) => {
        // 模拟网络延迟
        setTimeout(() => {
            resolve({
                code: 0,
                user: { ...mockData }
            });
        }, randomInt(10, 50)); // 10-50ms延迟
    });
};

// 模拟清除数据API
export const clearMockData = (): Promise<ClearResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 清除所有数据
            mockData = {};
            
            // 重新初始化新的模拟数据
            setTimeout(() => {
                initializeMockData();
            }, 1000); // 1秒后重新开始模拟数据
            
            resolve({
                code: 0,
                msg: 'Statistics have been cleared!'
            });
        }, randomInt(20, 100));
    });
};

// 添加新玩家的函数（用于测试）
export const addMockPlayer = (customUid?: string): void => {
    const uid = customUid || MOCK_UIDS[Math.floor(Math.random() * MOCK_UIDS.length)];
    if (!mockData[uid]) {
        mockData[uid] = generateRandomDamageData();
    }
};

// 移除玩家的函数（用于测试）
export const removeMockPlayer = (uid: string): void => {
    delete mockData[uid];
};

// 获取当前模拟玩家列表
export const getMockPlayerList = (): string[] => {
    return Object.keys(mockData);
};

// 重置模拟数据
export const resetMockData = (): void => {
    initializeMockData();
};

// 导出用于开发环境的标志
export const IS_MOCK_MODE = true;
