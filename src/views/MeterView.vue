<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { DPSBysUid } from '../types/data';
import { getData } from '../api/data';
import DevTools from '../components/DevTools.vue';

const data = ref<DPSBysUid>({});
let intervalId: number | null = null;

const isDevelopment = computed(() => import.meta.env.DEV || import.meta.env.MODE === 'development');

const sortedData = computed(() => {
    const entries = Object.entries(data.value);
    return entries
        .sort(([, a], [, b]) => b.total_damage.total - a.total_damage.total)
        .map(([uid, item]) => ({ uid, ...item }));
});

const getRowBackgroundColor = (index: number, totalCount: number) => {
    if (totalCount <= 1) return 'rgba(0, 0, 0, 0.1)';
    
    const rankPercent = index / (totalCount - 1);
    
    if (index === 0) {
        return 'rgba(255, 215, 0, 0.15)';
    } else if (index === 1 && totalCount > 2) {
        return 'rgba(192, 192, 192, 0.12)';
    } else if (index === 2 && totalCount > 3) {
        return 'rgba(205, 127, 50, 0.1)';
    } else {
        const hue = 120 * (1 - rankPercent); 
        return `hsla(${hue}, 60%, 50%, 0.08)`;
    }
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
                    <th data-tauri-drag-region>UID</th>
                    <th data-tauri-drag-region>实时DPS</th>
                    <th data-tauri-drag-region>总伤害</th>
                    <th data-tauri-drag-region>暴击伤害</th>
                    <th data-tauri-drag-region>幸运伤害</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(player, index) in sortedData" :key="player.uid" 
                    :style="{ backgroundColor: getRowBackgroundColor(index, sortedData.length) }"
                    class="damage-row">
                    <td class="uid-cell">
                        <span v-if="index === 0" class="rank-icon gold">👑</span>
                        <span v-else-if="index === 1" class="rank-icon silver">🥈</span>
                        <span v-else-if="index === 2" class="rank-icon bronze">🥉</span>
                        <span v-else class="rank-number">{{ index + 1 }}</span>
                        {{ player.uid }}
                    </td>
                    <td class="dps-cell">{{ formatDPS(player.realtime_dps) }}</td>
                    <td class="damage-cell">{{ formatNumber(player.total_damage.total) }}</td>
                    <td class="critical-cell">{{ formatNumber(player.total_damage.critical) }}</td>
                    <td class="lucky-cell">{{ formatNumber(player.total_damage.lucky) }}</td>
                </tr>
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
}

.damage-row:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
    border-left: 3px solid rgba(255, 255, 255, 0.5);
    transform: translateX(2px);
}

.rank-icon {
    margin-right: 5px;
    font-size: 12px;
}

.rank-icon.gold {
    filter: drop-shadow(0 0 3px #ffd700);
}

.rank-icon.silver {
    filter: drop-shadow(0 0 2px #c0c0c0);
}

.rank-icon.bronze {
    filter: drop-shadow(0 0 2px #cd7f32);
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
    max-width: 100px; 
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    align-items: center;
}

.dps-cell {
    color: #90EE90;
    font-weight: bold;
    text-align: right;
    min-width: 70px;
}

.damage-cell {
    color: #FFD700;
    font-weight: bold;
    text-align: right;
    min-width: 80px;
}

.critical-cell {
    color: #FF6B6B;
    font-weight: bold;
    text-align: right;
    min-width: 80px;
}

.lucky-cell {
    color: #87CEEB;
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
    
    .meter-table {
        min-width: 400px;
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
}
</style>