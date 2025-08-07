<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { DPSBysUid } from '../types/data';
import { getData } from '../api/data';
import DevTools from '../components/DevTools.vue';

const data = ref<DPSBysUid>({});
const expandedRows = ref<Set<string>>(new Set());
const expandedDetails = ref<Set<string>>(new Set());
let intervalId: number | null = null;

const isDevelopment = computed(
    () => import.meta.env.DEV || import.meta.env.MODE === 'development'
);

const toggleRowExpansion = (uid: string) => {
    if (expandedRows.value.has(uid)) {
        expandedRows.value.delete(uid);
    } else {
        expandedRows.value.add(uid);
    }
    expandedRows.value = new Set(expandedRows.value); // 触发响应式更新
};

const isRowExpanded = (uid: string) => {
    return expandedRows.value.has(uid);
};

const toggleDetailExpansion = (uid: string) => {
    if (expandedDetails.value.has(uid)) {
        expandedDetails.value.delete(uid);
    } else {
        expandedDetails.value.add(uid);
    }
    expandedDetails.value = new Set(expandedDetails.value);
};

const isDetailExpanded = (uid: string) => {
    return expandedDetails.value.has(uid);
};

const sortedData = computed(() => {
    const entries = Object.entries(data.value);
    const sorted = entries
        .sort(([, a], [, b]) => b.total_damage.total - a.total_damage.total)
        .map(([uid, item]) => ({ uid, ...item }));

    const totalTeamDamage = sorted.reduce(
        (sum, player) => sum + player.total_damage.total,
        0
    );

    return sorted.map((player, index) => ({
        ...player,
        damagePercent:
            totalTeamDamage > 0
                ? (player.total_damage.total / totalTeamDamage) * 100
                : 0,
        rank: index + 1,
    }));
});

const getProgressBarStyle = (damagePercent: number, rank: number) => {
    const totalPlayers = sortedData.value.length;
    const hue = Math.min(
        240,
        (240 * (rank - 1)) / Math.max(1, totalPlayers - 1)
    );

    const saturation = Math.max(70, 100 - rank * 3);
    const lightness = Math.max(45, 60 - rank * 1.5);
    const alpha = 0.35;

    return {
        background: `linear-gradient(to right, 
            hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha}) 0%, 
            hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha}) ${damagePercent}%, 
            rgba(0, 0, 0, 0.1) ${damagePercent}%, 
            rgba(0, 0, 0, 0.1) 100%)`,
    };
};

const fetchData = async () => {
    try {
        const response = await getData();
        if (response.code === 0) {
            data.value = response.user;
        }
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
};

const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(0);
};

const formatDPS = (num: number): string => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(1);
};

// 职业映射配置
const professionConfig: Record<string, { type: string; role: string; color: string }> = {
    '射线': { type: 'C', role: '法', color: '#ff9500' },   // 橙色
    '冰矛': { type: 'C', role: '法', color: '#ff9500' },   // 橙色
    '居合': { type: 'C', role: '近', color: '#ff9500' },   // 橙色
    '月刃': { type: 'C', role: '近', color: '#ff9500' },   // 橙色
    '空枪': { type: 'C', role: '近', color: '#ff9500' },   // 橙色
    '重装': { type: 'C', role: '近', color: '#ff9500' },   // 橙色
    '鹰弓': { type: 'C', role: '远', color: '#ff9500' },   // 橙色
    '狼弓': { type: 'C', role: '远', color: '#ff9500' },   // 橙色
    '防盾': { type: 'T', role: '坦', color: '#007acc' },   // 蓝色
    '光盾': { type: 'T', role: '坦', color: '#007acc' },   // 蓝色
    '岩盾': { type: 'T', role: '坦', color: '#007acc' },   // 蓝色
    '格挡': { type: 'T', role: '坦', color: '#007acc' },   // 蓝色
    '协奏': { type: 'N', role: '辅', color: '#22c55e' },   // 绿色
    '狂音': { type: 'N', role: '辅', color: '#22c55e' },   // 绿色
    '愈合': { type: 'N', role: '奶', color: '#22c55e' },   // 绿色
    '惩戒': { type: 'N', role: '奶', color: '#22c55e' },   // 绿色
};

// 获取职业信息
const getProfessionInfo = (profession: string) => {
    return professionConfig[profession] || { type: '?', role: '未知', color: '#6b7280' };
};

onMounted(() => {
    fetchData();
    intervalId = setInterval(fetchData, 200);
});

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId);
    }
});
</script>
<template>
    <div class="damage-meter">
        <div class="table-container">
            <table class="meter-table">
                <thead data-tauri-drag-region class="drag-header">
                    <tr data-tauri-drag-region>
                        <th data-tauri-drag-region>职业 / UID</th>
                        <th data-tauri-drag-region>实时DPS</th>
                        <th data-tauri-drag-region>总伤害</th>
                        <th data-tauri-drag-region>暴击伤害</th>
                        <th data-tauri-drag-region>幸运伤害</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="player in sortedData" :key="player.uid">
                        <tr
                            :style="
                                getProgressBarStyle(
                                    player.damagePercent,
                                    player.rank
                                )
                            "
                            class="damage-row"
                            @click="toggleRowExpansion(player.uid)"
                        >
                            <td class="uid-cell">
                                <span
                                    v-if="player.rank === 1"
                                    class="rank-icon gold"
                                    >👑</span
                                >
                                <span
                                    v-else-if="player.rank === 2"
                                    class="rank-icon silver"
                                    >🥈</span
                                >
                                <span
                                    v-else-if="player.rank === 3"
                                    class="rank-icon bronze"
                                    >🥉</span
                                >
                                <span v-else class="rank-number">{{
                                    player.rank
                                }}</span>
                                <div class="uid-info">
                                    <div class="profession-info">
                                        <span 
                                            class="profession-name"
                                            :style="{ color: getProfessionInfo(player.profession || '未知').color }"
                                        >
                                            {{ player.profession || '未知' }}
                                        </span>
                                        <span class="profession-role">
                                            {{ getProfessionInfo(player.profession || '未知').role }}
                                        </span>
                                    </div>
                                    <div class="uid-text">{{ player.uid }}</div>
                                </div>
                                <span
                                    class="expand-indicator"
                                    :class="{
                                        expanded: isRowExpanded(player.uid),
                                    }"
                                >
                                    {{ isRowExpanded(player.uid) ? '▼' : '▶' }}
                                </span>
                            </td>
                            <td class="dps-cell">
                                {{ formatDPS(player.realtime_dps) }}
                            </td>
                            <td class="damage-cell">
                                {{ formatNumber(player.total_damage.total) }}
                                <span class="damage-percent"
                                    >({{
                                        player.damagePercent.toFixed(1)
                                    }}%)</span
                                >
                            </td>
                            <td class="critical-cell">
                                {{ formatNumber(player.total_damage.critical) }}
                            </td>
                            <td class="lucky-cell">
                                {{ formatNumber(player.total_damage.lucky) }}
                            </td>
                        </tr>

                        <!-- 展开的详细信息行 -->
                        <tr v-if="isRowExpanded(player.uid)" class="detail-row">
                            <td colspan="5" class="detail-content">
                                <div class="detail-container">
                                    <!-- 紧凑的主要统计信息 -->
                                    <div class="compact-stats">
                                        <div class="compact-stat highlight">
                                            <div class="compact-label">
                                                总伤害
                                            </div>
                                            <div class="compact-value">
                                                {{
                                                    formatNumber(
                                                        player.total_damage
                                                            .total
                                                    )
                                                }}
                                            </div>
                                            <div class="compact-percent">
                                                {{
                                                    player.damagePercent.toFixed(
                                                        1
                                                    )
                                                }}%
                                            </div>
                                        </div>
                                        <div class="compact-stat">
                                            <div class="compact-label">
                                                实时DPS
                                            </div>
                                            <div class="compact-value">
                                                {{
                                                    formatDPS(
                                                        player.realtime_dps
                                                    )
                                                }}
                                            </div>
                                        </div>
                                        <div class="compact-stat">
                                            <div class="compact-label">
                                                最大DPS
                                            </div>
                                            <div class="compact-value">
                                                {{
                                                    formatDPS(
                                                        player.realtime_dps_max
                                                    )
                                                }}
                                            </div>
                                        </div>
                                        <div class="compact-stat">
                                            <div class="compact-label">
                                                总体DPS
                                            </div>
                                            <div class="compact-value">
                                                {{
                                                    formatDPS(player.total_dps)
                                                }}
                                            </div>
                                        </div>
                                        <!-- 治疗相关统计 -->
                                        <div 
                                            class="compact-stat" 
                                            v-if="player.total_healing && player.total_healing.total > 0"
                                        >
                                            <div class="compact-label">
                                                总治疗
                                            </div>
                                            <div class="compact-value healing">
                                                {{
                                                    formatNumber(player.total_healing.total)
                                                }}
                                            </div>
                                        </div>
                                        <div 
                                            class="compact-stat" 
                                            v-if="player.realtime_hps && player.realtime_hps > 0"
                                        >
                                            <div class="compact-label">
                                                实时HPS
                                            </div>
                                            <div class="compact-value healing">
                                                {{
                                                    formatDPS(player.realtime_hps)
                                                }}
                                            </div>
                                        </div>
                                        <div 
                                            class="compact-stat" 
                                            v-if="player.total_hps && player.total_hps > 0"
                                        >
                                            <div class="compact-label">
                                                总体HPS
                                            </div>
                                            <div class="compact-value healing">
                                                {{
                                                    formatDPS(player.total_hps)
                                                }}
                                            </div>
                                        </div>
                                        <div 
                                            class="compact-stat" 
                                            v-if="player.taken_damage && player.taken_damage > 0"
                                        >
                                            <div class="compact-label">
                                                承受伤害
                                            </div>
                                            <div class="compact-value taken-damage">
                                                {{
                                                    formatNumber(player.taken_damage)
                                                }}
                                            </div>
                                        </div>
                                    </div>

                                    <!-- 二级展开控制 -->
                                    <div
                                        class="detail-toggle"
                                        @click="
                                            toggleDetailExpansion(player.uid)
                                        "
                                    >
                                        <span class="toggle-text"
                                            >详细数据</span
                                        >
                                        <span
                                            class="toggle-icon"
                                            :class="{
                                                expanded: isDetailExpanded(
                                                    player.uid
                                                ),
                                            }"
                                        >
                                            {{
                                                isDetailExpanded(player.uid)
                                                    ? '▲'
                                                    : '▼'
                                            }}
                                        </span>
                                    </div>

                                    <!-- 详细数据网格 (二级展开) -->
                                    <div
                                        v-if="isDetailExpanded(player.uid)"
                                        class="detail-grid"
                                    >
                                        <!-- 伤害分布 -->
                                        <div
                                            class="detail-section damage-section"
                                        >
                                            <h4>
                                                <span class="icon">⚔️</span>
                                                伤害分布
                                            </h4>
                                            <div class="data-grid">
                                                <div class="data-item">
                                                    <span class="label"
                                                        >普通伤害</span
                                                    >
                                                    <span
                                                        class="value normal"
                                                        >{{
                                                            formatNumber(
                                                                player
                                                                    .total_damage
                                                                    .normal
                                                            )
                                                        }}</span
                                                    >
                                                    <span class="percent"
                                                        >({{
                                                            (
                                                                (player
                                                                    .total_damage
                                                                    .normal /
                                                                    player
                                                                        .total_damage
                                                                        .total) *
                                                                100
                                                            ).toFixed(1)
                                                        }}%)</span
                                                    >
                                                </div>
                                                <div class="data-item">
                                                    <span class="label"
                                                        >暴击伤害</span
                                                    >
                                                    <span
                                                        class="value critical"
                                                        >{{
                                                            formatNumber(
                                                                player
                                                                    .total_damage
                                                                    .critical
                                                            )
                                                        }}</span
                                                    >
                                                    <span class="percent"
                                                        >({{
                                                            (
                                                                (player
                                                                    .total_damage
                                                                    .critical /
                                                                    player
                                                                        .total_damage
                                                                        .total) *
                                                                100
                                                            ).toFixed(1)
                                                        }}%)</span
                                                    >
                                                </div>
                                                <div class="data-item">
                                                    <span class="label"
                                                        >幸运伤害</span
                                                    >
                                                    <span class="value lucky">{{
                                                        formatNumber(
                                                            player.total_damage
                                                                .lucky
                                                        )
                                                    }}</span>
                                                    <span class="percent"
                                                        >({{
                                                            (
                                                                (player
                                                                    .total_damage
                                                                    .lucky /
                                                                    player
                                                                        .total_damage
                                                                        .total) *
                                                                100
                                                            ).toFixed(1)
                                                        }}%)</span
                                                    >
                                                </div>
                                                <div class="data-item">
                                                    <span class="label"
                                                        >暴击幸运</span
                                                    >
                                                    <span
                                                        class="value crit-lucky"
                                                        >{{
                                                            formatNumber(
                                                                player
                                                                    .total_damage
                                                                    .crit_lucky
                                                            )
                                                        }}</span
                                                    >
                                                    <span class="percent"
                                                        >({{
                                                            (
                                                                (player
                                                                    .total_damage
                                                                    .crit_lucky /
                                                                    player
                                                                        .total_damage
                                                                        .total) *
                                                                100
                                                            ).toFixed(1)
                                                        }}%)</span
                                                    >
                                                </div>
                                                <div class="data-item">
                                                    <span class="label"
                                                        >生命减少</span
                                                    >
                                                    <span
                                                        class="value hp-lessen"
                                                        >{{
                                                            formatNumber(
                                                                player
                                                                    .total_damage
                                                                    .hpLessen
                                                            )
                                                        }}</span
                                                    >
                                                    <span class="percent"
                                                        >({{
                                                            (
                                                                (player
                                                                    .total_damage
                                                                    .hpLessen /
                                                                    player
                                                                        .total_damage
                                                                        .total) *
                                                                100
                                                            ).toFixed(1)
                                                        }}%)</span
                                                    >
                                                </div>
                                            </div>
                                        </div>

                                        <!-- 治疗统计 -->
                                        <div
                                            class="detail-section healing-section"
                                            v-if="player.total_healing && player.total_healing.total > 0"
                                        >
                                            <h4>
                                                <span class="icon">💚</span>
                                                治疗分布
                                            </h4>
                                            <div class="data-grid">
                                                <div class="data-item">
                                                    <span class="label">普通治疗</span>
                                                    <span class="value normal">{{
                                                        formatNumber(player.total_healing.normal)
                                                    }}</span>
                                                    <span class="percent">({{
                                                        player.total_healing.total > 0 
                                                            ? ((player.total_healing.normal / player.total_healing.total) * 100).toFixed(1)
                                                            : '0'
                                                    }}%)</span>
                                                </div>
                                                <div class="data-item">
                                                    <span class="label">暴击治疗</span>
                                                    <span class="value critical">{{
                                                        formatNumber(player.total_healing.critical)
                                                    }}</span>
                                                    <span class="percent">({{
                                                        player.total_healing.total > 0 
                                                            ? ((player.total_healing.critical / player.total_healing.total) * 100).toFixed(1)
                                                            : '0'
                                                    }}%)</span>
                                                </div>
                                                <div class="data-item">
                                                    <span class="label">幸运治疗</span>
                                                    <span class="value lucky">{{
                                                        formatNumber(player.total_healing.lucky)
                                                    }}</span>
                                                    <span class="percent">({{
                                                        player.total_healing.total > 0 
                                                            ? ((player.total_healing.lucky / player.total_healing.total) * 100).toFixed(1)
                                                            : '0'
                                                    }}%)</span>
                                                </div>
                                                <div class="data-item">
                                                    <span class="label">暴击幸运治疗</span>
                                                    <span class="value crit-lucky">{{
                                                        formatNumber(player.total_healing.crit_lucky)
                                                    }}</span>
                                                    <span class="percent">({{
                                                        player.total_healing.total > 0 
                                                            ? ((player.total_healing.crit_lucky / player.total_healing.total) * 100).toFixed(1)
                                                            : '0'
                                                    }}%)</span>
                                                </div>
                                                <div class="data-item total-item">
                                                    <span class="label">总治疗量</span>
                                                    <span class="value total">{{
                                                        formatNumber(player.total_healing.total)
                                                    }}</span>
                                                    <span class="percent">100%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- 攻击统计 -->
                                        <div
                                            class="detail-section attack-section"
                                        >
                                            <h4>
                                                <span class="icon">🎯</span>
                                                攻击统计
                                            </h4>
                                            <div class="data-grid">
                                                <div class="data-item">
                                                    <span class="label"
                                                        >普通攻击</span
                                                    >
                                                    <span class="value">{{
                                                        player.total_count.normal.toLocaleString()
                                                    }}</span>
                                                    <span class="percent"
                                                        >({{
                                                            (
                                                                (player
                                                                    .total_count
                                                                    .normal /
                                                                    player
                                                                        .total_count
                                                                        .total) *
                                                                100
                                                            ).toFixed(1)
                                                        }}%)</span
                                                    >
                                                </div>
                                                <div class="data-item">
                                                    <span class="label"
                                                        >暴击次数</span
                                                    >
                                                    <span class="value">{{
                                                        player.total_count.critical.toLocaleString()
                                                    }}</span>
                                                    <span class="percent"
                                                        >({{
                                                            (
                                                                (player
                                                                    .total_count
                                                                    .critical /
                                                                    player
                                                                        .total_count
                                                                        .total) *
                                                                100
                                                            ).toFixed(1)
                                                        }}%)</span
                                                    >
                                                </div>
                                                <div class="data-item">
                                                    <span class="label"
                                                        >幸运次数</span
                                                    >
                                                    <span class="value">{{
                                                        player.total_count.lucky.toLocaleString()
                                                    }}</span>
                                                    <span class="percent"
                                                        >({{
                                                            (
                                                                (player
                                                                    .total_count
                                                                    .lucky /
                                                                    player
                                                                        .total_count
                                                                        .total) *
                                                                100
                                                            ).toFixed(1)
                                                        }}%)</span
                                                    >
                                                </div>
                                                <div
                                                    class="data-item total-item"
                                                >
                                                    <span class="label"
                                                        >总攻击数</span
                                                    >
                                                    <span class="value total">{{
                                                        player.total_count.total.toLocaleString()
                                                    }}</span>
                                                    <span class="percent"
                                                        >100%</span
                                                    >
                                                </div>
                                            </div>
                                        </div>

                                        <!-- 效率分析 -->
                                        <div
                                            class="detail-section efficiency-section"
                                        >
                                            <h4>
                                                <span class="icon">📊</span>
                                                效率分析
                                            </h4>
                                            <div class="data-grid">
                                                <div class="data-item">
                                                    <span class="label"
                                                        >暴击率</span
                                                    >
                                                    <span class="value rate"
                                                        >{{
                                                            (
                                                                (player
                                                                    .total_count
                                                                    .critical /
                                                                    player
                                                                        .total_count
                                                                        .total) *
                                                                100
                                                            ).toFixed(1)
                                                        }}%</span
                                                    >
                                                </div>
                                                <div class="data-item">
                                                    <span class="label"
                                                        >幸运率</span
                                                    >
                                                    <span class="value rate"
                                                        >{{
                                                            (
                                                                (player
                                                                    .total_count
                                                                    .lucky /
                                                                    player
                                                                        .total_count
                                                                        .total) *
                                                                100
                                                            ).toFixed(1)
                                                        }}%</span
                                                    >
                                                </div>
                                                <div class="data-item">
                                                    <span class="label"
                                                        >平均伤害</span
                                                    >
                                                    <span class="value">{{
                                                        formatNumber(
                                                            player.total_damage
                                                                .total /
                                                                player
                                                                    .total_count
                                                                    .total
                                                        )
                                                    }}</span>
                                                </div>
                                                <div class="data-item">
                                                    <span class="label"
                                                        >暴击倍率</span
                                                    >
                                                    <span
                                                        class="value multiplier"
                                                        >{{
                                                            (
                                                                player
                                                                    .total_damage
                                                                    .critical /
                                                                (player
                                                                    .total_count
                                                                    .critical *
                                                                    (player
                                                                        .total_damage
                                                                        .normal /
                                                                        player
                                                                            .total_count
                                                                            .normal))
                                                            ).toFixed(1)
                                                        }}x</span
                                                    >
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>

        <DevTools v-if="isDevelopment" />
    </div>
</template>
<style lang="css" scoped>
.damage-meter {
    padding: 10px;
    font-family: 'Arial', sans-serif;
    height: 100vh;
    width: 100vw;
    box-sizing: border-box;
    overflow: hidden;
}

.table-container {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    border-radius: 8px;
    background-color: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 自定义滚动条样式 */
.table-container::-webkit-scrollbar {
    width: 8px;
}

.table-container::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    transition: background 0.2s ease;
}

.table-container::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}

.meter-table {
    width: 100%;
    border-collapse: collapse;
    background-color: transparent;
    min-width: 500px; /* 确保表格有最小宽度 */
}

.meter-table th,
.meter-table td {
    padding: 8px 12px;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    font-weight: 500;
    font-size: 13px;
    white-space: nowrap;
}

.meter-table th {
    background-color: rgba(0, 0, 0, 0.4);
    font-weight: bold;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    position: sticky;
    top: 0;
    z-index: 10;
    cursor: move; /* 显示拖拽光标 */
}

/* Tauri 拖拽区域样式 */
[data-tauri-drag-region] {
    -webkit-app-region: drag;
    /* app-region: drag; */ /* 注释掉以避免 CSS 验证警告 */
    cursor: move;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

.drag-header {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4));
    border-bottom: 2px solid rgba(255, 255, 255, 0.3);
}

.drag-header:hover {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
}

.meter-table tbody tr {
    transition: all 0.3s ease;
    border-left: 3px solid transparent;
    cursor: pointer; /* 添加指针光标表示可点击 */
}

.damage-row:hover {
    border-left: 3px solid rgba(255, 255, 255, 0.5);
    transform: translateX(2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 展开指示器样式 */
.expand-indicator {
    margin-left: 8px;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.6);
    transition: transform 0.2s ease;
}

.expand-indicator.expanded {
    transform: rotate(0deg);
}

/* 详细信息行样式 */
.detail-row {
    background-color: rgba(0, 0, 0, 0.4) !important;
    border-left: 3px solid rgba(255, 255, 255, 0.3) !important;
    cursor: default !important;
}

.detail-row:hover {
    transform: none !important;
    box-shadow: none !important;
}

.detail-content {
    padding: 15px 20px !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.detail-container {
    color: white;
    width: 100%;
}

/* 紧凑的主要统计卡片 - 固定在一行，高度不超过40px */
.compact-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 15px;
    height: 50px;
}

.compact-stat {
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0.05)
    );
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 4px 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
}

.compact-stat:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.4);
}

.compact-stat.highlight {
    background: linear-gradient(
        135deg,
        rgba(255, 215, 0, 0.2),
        rgba(255, 215, 0, 0.1)
    );
    border-color: rgba(255, 215, 0, 0.5);
}

.compact-label {
    font-size: 8px;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    font-weight: 500;
    line-height: 1;
    margin-bottom: 2px;
}

.compact-value {
    font-size: 12px;
    font-weight: bold;
    color: #ffd700;
    line-height: 1;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.compact-value.healing {
    color: #22c55e;
}

.compact-value.taken-damage {
    color: #ef4444;
}

.compact-percent {
    font-size: 7px;
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
    line-height: 1;
    position: absolute;
    bottom: 2px;
    right: 4px;
}

/* 二级展开控制 */
.detail-toggle {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    margin-bottom: 15px;
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0.05)
    );
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    user-select: none;
}

.detail-toggle:hover {
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.15),
        rgba(255, 255, 255, 0.08)
    );
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
}

.toggle-text {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.toggle-icon {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.6);
    transition: transform 0.3s ease;
}

.toggle-icon.expanded {
    transform: rotate(180deg);
}

/* 详细数据网格 */
.detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
}

.detail-section {
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.08),
        rgba(255, 255, 255, 0.03)
    );
    padding: 12px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(5px);
    transition: all 0.3s ease;
}

.detail-section:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.25);
}

.detail-section.damage-section {
    border-left: 3px solid #ff6b6b;
}

.detail-section.healing-section {
    border-left: 3px solid #22c55e;
}

.detail-section.attack-section {
    border-left: 3px solid #87ceeb;
}

.detail-section.efficiency-section {
    border-left: 3px solid #90ee90;
}

.detail-section h4 {
    margin: 0 0 10px 0;
    font-size: 11px;
    color: #ffd700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 6px;
    border-bottom: 1px solid rgba(255, 215, 0, 0.3);
    padding-bottom: 5px;
}

.detail-section h4 .icon {
    font-size: 12px;
}

.data-grid {
    display: grid;
    gap: 6px;
}

.data-item {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
}

.data-item:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateX(2px);
}

.data-item.total-item {
    border: 1px solid rgba(255, 215, 0, 0.4);
    background: rgba(255, 215, 0, 0.1);
}

.data-item .label {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    font-size: 10px;
}

.data-item .value {
    color: #90ee90;
    font-weight: bold;
    font-size: 11px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    text-align: right;
    min-width: 60px;
}

.data-item .value.normal {
    color: #add8e6;
}
.data-item .value.critical {
    color: #ff6b6b;
}
.data-item .value.lucky {
    color: #87ceeb;
}
.data-item .value.crit-lucky {
    color: #ff1493;
}
.data-item .value.hp-lessen {
    color: #ffa500;
}
.data-item .value.total {
    color: #ffd700;
    font-size: 12px;
}
.data-item .value.rate {
    color: #98fb98;
}
.data-item .value.multiplier {
    color: #dda0dd;
}

.data-item .percent {
    font-size: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
    min-width: 40px;
    text-align: right;
}

.rank-icon {
    margin-right: 5px;
    font-size: 12px;
}

.rank-icon.gold {
    filter: drop-shadow(0 0 3px #ff0000); /* 红色光晕 - 对应第一名的红色 */
}

.rank-icon.silver {
    filter: drop-shadow(0 0 2px #ff8c00); /* 橙色光晕 - 对应第二名的橙色 */
}

.rank-icon.bronze {
    filter: drop-shadow(0 0 2px #ffd700); /* 黄色光晕 - 对应第三名的黄色 */
}

.rank-number {
    display: inline-block;
    min-width: 16px;
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: 10px;
    margin-right: 5px;
}

.uid-cell {
    font-family: 'Courier New', monospace;
    font-size: 11px;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 6px;
}

.uid-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
}

.profession-info {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
}

.profession-name {
    font-weight: bold;
    font-size: 10px;
}

.profession-role {
    color: rgba(255, 255, 255, 0.6);
    font-size: 9px;
    background: rgba(255, 255, 255, 0.1);
    padding: 1px 4px;
    border-radius: 8px;
}

.uid-text {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.8);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.dps-cell {
    color: #90ee90;
    font-weight: bold;
    text-align: right;
    min-width: 70px;
}

.damage-cell {
    color: #ffd700;
    font-weight: bold;
    text-align: right;
    min-width: 110px; /* 增加宽度以容纳百分比 */
}

.damage-percent {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.7);
    margin-left: 5px;
    font-weight: normal;
}

.critical-cell {
    color: #ff6b6b;
    font-weight: bold;
    text-align: right;
    min-width: 80px;
}

.lucky-cell {
    color: #87ceeb;
    font-weight: bold;
    text-align: right;
    min-width: 80px;
}

/* 小屏幕优化 */
@media (max-width: 600px) {
    .damage-meter {
        padding: 5px;
    }

    .meter-table th,
    .meter-table td {
        padding: 6px 8px;
        font-size: 11px;
    }

    .meter-table th {
        font-size: 10px;
    }

    .uid-cell {
        /* max-width: 120px; */
        font-size: 10px;
    }

    .rank-icon {
        font-size: 10px;
        margin-right: 3px;
    }

    .rank-number {
        font-size: 9px;
        margin-right: 3px;
    }

    .dps-cell,
    .damage-cell,
    .critical-cell,
    .lucky-cell {
        min-width: 60px;
    }

    .damage-cell {
        min-width: 80px; /* 为百分比保留更多空间 */
    }

    .damage-percent {
        font-size: 9px;
        margin-left: 3px;
    }

    .meter-table {
        min-width: 400px;
    }

    /* 小屏幕详细信息样式 */
    .detail-content {
        padding: 12px 15px !important;
    }

    .compact-stats {
        gap: 6px;
        margin-bottom: 12px;
        height: 50px;
    }

    .compact-stat {
        padding: 3px 6px;
    }

    .compact-label {
        font-size: 7px;
    }

    .compact-value {
        font-size: 10px;
    }

    .compact-percent {
        font-size: 6px;
    }

    .detail-toggle {
        padding: 6px 10px;
        margin-bottom: 12px;
    }

    .toggle-text {
        font-size: 10px;
    }

    .toggle-icon {
        font-size: 9px;
    }

    .detail-grid {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .detail-section {
        padding: 10px;
    }

    .detail-section h4 {
        font-size: 10px;
        margin-bottom: 8px;
    }

    .detail-section h4 .icon {
        font-size: 11px;
    }

    .data-item {
        padding: 5px 8px;
        gap: 6px;
    }

    .data-item .label {
        font-size: 9px;
    }

    .data-item .value {
        font-size: 10px;
        min-width: 50px;
    }

    .data-item .value.total {
        font-size: 11px;
    }

    .data-item .percent {
        font-size: 7px;
        min-width: 35px;
    }

    .expand-indicator {
        font-size: 8px;
        margin-left: 5px;
    }
}

/* 超小屏幕优化 */
@media (max-width: 400px) {
    .meter-table {
        min-width: 350px;
    }

    .dps-cell,
    .damage-cell,
    .critical-cell,
    .lucky-cell {
        min-width: 50px;
    }

    /* 超小屏幕详细信息样式 */
    .detail-content {
        padding: 10px 12px !important;
    }

    .compact-stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 4px;
        margin-bottom: 10px;
        height: auto;
    }

    .compact-stat {
        padding: 3px 5px;
        height: 28px;
    }

    .compact-label {
        font-size: 6px;
    }

    .compact-value {
        font-size: 9px;
    }

    .compact-percent {
        font-size: 5px;
        bottom: 1px;
        right: 2px;
    }

    .detail-toggle {
        padding: 5px 8px;
        margin-bottom: 10px;
    }

    .toggle-text {
        font-size: 9px;
    }

    .toggle-icon {
        font-size: 8px;
    }

    .detail-grid {
        grid-template-columns: 1fr;
        gap: 10px;
    }

    .detail-section {
        padding: 8px;
    }

    .detail-section h4 {
        font-size: 9px;
        margin-bottom: 6px;
    }

    .detail-section h4 .icon {
        font-size: 10px;
    }

    .data-item {
        padding: 4px 6px;
        gap: 4px;
        grid-template-columns: 1fr auto;
    }

    .data-item .label {
        font-size: 8px;
    }

    .data-item .value {
        font-size: 9px;
        min-width: 45px;
    }

    .data-item .value.total {
        font-size: 10px;
    }

    .data-item .percent {
        display: none; /* 在超小屏幕上隐藏百分比 */
    }
}
</style>
