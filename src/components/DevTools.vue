<template>
  <div v-if="showDevTools" class="dev-tools">
    <button @click="toggleDevTools" class="toggle-btn" title="Hide Dev Tools">
      🛠️
    </button>
    <div class="dev-panel">
      <h3>开发工具</h3>
      <div class="controls">
        <button @click="addPlayer" class="btn">添加玩家</button>
        <button @click="clearData" class="btn btn-warning">清除数据</button>
        <button @click="resetData" class="btn btn-danger">重置数据</button>
      </div>
      <div class="info">
        <p>当前玩家数: {{ playerCount }}</p>
        <p>模拟模式: {{ isMockMode ? '开启' : '关闭' }}</p>
        <p>环境: {{ isDev ? '开发' : '生产' }}</p>
      </div>
      <div class="player-list">
        <h4>玩家列表:</h4>
        <div v-for="uid in playerList" :key="uid" class="player-item">
          <span class="uid">{{ uid.slice(-6) }}</span>
          <button @click="removePlayer(uid)" class="btn-small btn-danger">移除</button>
        </div>
      </div>
    </div>
  </div>
  <button v-else @click="toggleDevTools" class="toggle-btn collapsed" title="Show Dev Tools">
    🛠️
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  addMockPlayer, 
  removeMockPlayer, 
  getMockPlayerList, 
  resetMockData,
  IS_MOCK_MODE 
} from '../api/mock';
import { clearData as apiClearData } from '../api/data';

const showDevTools = ref(false);
const playerList = ref<string[]>([]);

const isDev = computed(() => import.meta.env.DEV || import.meta.env.MODE === 'development');
const isMockMode = computed(() => IS_MOCK_MODE);
const playerCount = computed(() => playerList.value.length);

const toggleDevTools = () => {
  showDevTools.value = !showDevTools.value;
  if (showDevTools.value) {
    updatePlayerList();
  }
};

const updatePlayerList = () => {
  playerList.value = getMockPlayerList();
};

const addPlayer = () => {
  addMockPlayer();
  updatePlayerList();
};

const removePlayer = (uid: string) => {
  removeMockPlayer(uid);
  updatePlayerList();
};

const clearData = async () => {
  try {
    await apiClearData();
    updatePlayerList();
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
};

const resetData = () => {
  resetMockData();
  updatePlayerList();
};

onMounted(() => {
  updatePlayerList();
  setInterval(updatePlayerList, 1000);
});
</script>

<style scoped>
.dev-tools {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
  font-family: 'Arial', sans-serif;
}

.toggle-btn {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.toggle-btn.collapsed {
  position: fixed;
  top: 10px;
  right: 10px;
}

.dev-panel {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin-top: 10px;
  min-width: 250px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dev-panel h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #FFD700;
}

.dev-panel h4 {
  margin: 15px 0 8px 0;
  font-size: 14px;
  color: #87CEEB;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-warning {
  border-color: #FFA500;
  color: #FFA500;
}

.btn-warning:hover {
  background: rgba(255, 165, 0, 0.2);
}

.btn-danger {
  border-color: #FF6B6B;
  color: #FF6B6B;
}

.btn-danger:hover {
  background: rgba(255, 107, 107, 0.2);
}

.btn-small {
  padding: 4px 8px;
  font-size: 10px;
  margin-left: 8px;
}

.info {
  font-size: 12px;
  margin-bottom: 15px;
}

.info p {
  margin: 4px 0;
  color: #90EE90;
}

.player-list {
  max-height: 150px;
  overflow-y: auto;
}

.player-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 11px;
}

.uid {
  font-family: 'Courier New', monospace;
  color: #87CEEB;
}

/* 自定义滚动条 */
.player-list::-webkit-scrollbar {
  width: 4px;
}

.player-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.player-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
</style>
