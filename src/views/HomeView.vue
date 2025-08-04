<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { openUrl } from '@tauri-apps/plugin-opener'

const isConnected = ref(false)
const connectionStatus = ref('正在检测连接...')
let intervalId: number | null = null

const checkConnection = async () => {
  try {
    await fetch('http://localhost:8989/index.html', {
      method: 'HEAD',
      mode: 'no-cors'
    })
    isConnected.value = true
    connectionStatus.value = '已连接到伤害计数器'
  } catch (error) {
    isConnected.value = false
    connectionStatus.value = '等待连接到伤害计数器'
  }
}

const openGitHubRepo = async () => {
  await openUrl('https://github.com/dmlgzs/StarResonanceDamageCounter/')
}

const openLocalhost = async () => {
  await openUrl('http://localhost:8989')
}

onMounted(() => {
  checkConnection()
  intervalId = setInterval(checkConnection, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
    <div class="max-w-2xl w-full">
      <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 mb-8">
        <div class="text-center mb-8">
          <h1 class="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            星痕共鸣
          </h1>
          <h2 class="text-2xl font-semibold text-white/90 mb-2">
            DPS浮窗工具
          </h2>
          <div class="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
        </div>
        
        <div class="flex items-center justify-center mb-6">
          <div :class="[
            'flex items-center space-x-3 px-4 py-2 rounded-full border transition-all duration-300',
            isConnected 
              ? 'bg-green-500/20 text-green-300 border-green-400/30' 
              : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
          ]">
            <div :class="[
              'w-3 h-3 rounded-full',
              isConnected 
                ? 'bg-green-400' 
                : 'bg-amber-400 animate-pulse'
            ]"></div>
            <span class="text-sm font-medium">{{ connectionStatus }}</span>
          </div>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <div class="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
          <div class="flex items-center mb-4">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
              1
            </div>
            <h3 class="text-lg font-semibold text-white">安装依赖工具</h3>
          </div>
          <p class="text-white/70 text-sm leading-relaxed mb-4">
            此工具只是浮窗界面，你还需要安装核心的伤害计数器：
          </p>
          <button 
            @click="openGitHubRepo"
            class="inline-flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-4 py-2 rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200 text-sm"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg>
            <span>StarResonanceDamageCounter</span>
          </button>
        </div>

        <div class="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
          <div class="flex items-center mb-4">
            <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
              2
            </div>
            <h3 class="text-lg font-semibold text-white">验证连接</h3>
          </div>
          <p class="text-white/70 text-sm leading-relaxed mb-4">
            确保伤害计数器正在运行，然后检查本地服务：
          </p>
          <button 
            @click="openLocalhost"
            class="inline-flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-4 py-2 rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200 text-sm"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg>
            <span>localhost:8989</span>
          </button>
        </div>
      </div>

      <div class="mt-8 text-center">
        <p class="text-white/50 text-sm">
          连接成功后，浮窗将自动显示实时DPS数据
        </p>
      </div>
    </div>
  </div>
</template>
<style lang="css" scoped>
</style>