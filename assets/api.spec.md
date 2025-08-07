# 星痕共鸣DPS计数器 API 规范

## 概述

星痕共鸣DPS计数器通过网络抓包技术实时分析游戏战斗数据，提供RESTful API接口用于获取和管理战斗数据统计。

**服务器信息：**

- 默认端口：8989
- 基础URL：`http://localhost:8989`
- 协议：HTTP/HTTPS
- 支持CORS：是

**版本信息：**

- 当前版本：V2.2.1
- 最后更新：2025年8月
- GitHub：[StarResonanceDamageCounter](https://github.com/dmlgzs/StarResonanceDamageCounter)

## 数据结构

### 统计数据类型 (StatisticData)

```typescript
interface StatisticData {
  stats: {
    normal: number;      // 普通伤害/治疗总值
    critical: number;    // 纯暴击总值
    lucky: number;       // 纯幸运总值
    crit_lucky: number;  // 暴击+幸运总值
    hpLessen: number;    // 生命值减少量（仅伤害统计使用）
    total: number;       // 总值
  };
  count: {
    normal: number;      // 普通次数
    critical: number;    // 暴击次数
    lucky: number;       // 幸运次数
    total: number;       // 总次数
  };
  realtimeStats: {
    value: number;       // 当前实时值（过去1秒内）
    max: number;         // 历史最大实时值
  };
}
```

### 用户数据结构 (UserData)

```typescript
interface UserData {
  uid: string;                    // 用户ID
  realtime_dps: number;          // 当前实时DPS（每秒伤害）
  realtime_dps_max: number;      // 历史最大实时DPS
  total_dps: number;             // 总体平均DPS
  total_damage: DamageStats;     // 伤害统计详情
  total_count: CountStats;       // 次数统计详情
  realtime_hps: number;          // 当前实时HPS（每秒治疗）
  realtime_hps_max: number;      // 历史最大实时HPS
  total_hps: number;             // 总体平均HPS
  total_healing: HealingStats;   // 治疗统计详情
  taken_damage: number;          // 承受的伤害总量
  profession: string;            // 职业名称
}
```

### 伤害统计详情 (DamageStats)

```typescript
interface DamageStats {
  normal: number;        // 普通伤害总值
  critical: number;      // 纯暴击伤害总值
  lucky: number;         // 纯幸运伤害总值
  crit_lucky: number;    // 暴击+幸运伤害总值
  hpLessen: number;      // 生命值减少量
  total: number;         // 总伤害
}
```

### 治疗统计详情 (HealingStats)

```typescript
interface HealingStats {
  normal: number;        // 普通治疗总值
  critical: number;      // 暴击治疗总值
  lucky: number;         // 幸运治疗总值
  crit_lucky: number;    // 暴击+幸运治疗总值
  hpLessen: number;      // 固定为0（治疗不减血）
  total: number;         // 总治疗量
}
```

### 次数统计详情 (CountStats)

```typescript
interface CountStats {
  normal: number;        // 普通技能使用次数
  critical: number;      // 暴击次数
  lucky: number;         // 幸运次数
  total: number;         // 总次数（伤害+治疗）
}
```

## API 端点

### 1. 获取实时战斗数据

**端点：** `GET /api/data`

**描述：** 获取所有用户的实时战斗数据统计，包括DPS、伤害分类、治疗统计等。

**请求参数：** 无

**响应格式：**

```typescript
interface DataResponse {
  code: 0;                          // 状态码，0表示成功
  user: {
    [uid: string]: UserData;        // 用户ID为键的用户数据对象
  };
}
```

**响应示例：**

```json
{
  "code": 0,
  "user": {
    "114514": {
      "realtime_dps": 0,
      "realtime_dps_max": 3342,
      "total_dps": 451.970764813365,
      "total_damage": {
        "normal": 9411,
        "critical": 246,
        "lucky": 732,
        "crit_lucky": 0,
        "hpLessen": 8956,
        "total": 10389
      },
      "total_count": {
        "normal": 76,
        "critical": 5,
        "lucky": 1,
        "total": 82
      },
      "realtime_hps": 4017,
      "realtime_hps_max": 11810,
      "total_hps": 4497.79970662755,
      "total_healing": {
        "normal": 115924,
        "critical": 18992,
        "lucky": 0,
        "crit_lucky": 0,
        "hpLessen": 0,
        "total": 134916
      },
      "taken_damage": 65,
      "profession": "愈合"
    },
    "1919810": {
      "realtime_dps": 2845,
      "realtime_dps_max": 8934,
      "total_dps": 1205.43895721,
      "total_damage": {
        "normal": 45820,
        "critical": 12450,
        "lucky": 8930,
        "crit_lucky": 3200,
        "hpLessen": 42380,
        "total": 70400
      },
      "total_count": {
        "normal": 120,
        "critical": 25,
        "lucky": 8,
        "total": 153
      },
      "realtime_hps": 0,
      "realtime_hps_max": 0,
      "total_hps": 0,
      "total_healing": {
        "normal": 0,
        "critical": 0,
        "lucky": 0,
        "crit_lucky": 0,
        "hpLessen": 0,
        "total": 0
      },
      "taken_damage": 1250,
      "profession": "输出"
    }
  }
}
```

**数据说明：**

- `realtime_dps`: 基于过去1秒窗口计算的瞬时DPS
- `total_dps`: 从战斗开始到当前的平均DPS
- `total_damage.normal`: 非暴击非幸运的普通伤害
- `total_damage.critical`: 纯暴击伤害（暴击但非幸运）
- `total_damage.lucky`: 纯幸运伤害（幸运但非暴击）
- `total_damage.crit_lucky`: 暴击+幸运伤害
- `total_damage.hpLessen`: 实际造成的生命值减少
- `profession`: 自动识别的职业类型（如"愈合"、"输出"等）

### 2. 清空统计数据

**端点：** `GET /api/clear`

**描述：** 清空所有用户的战斗数据统计，重置为初始状态。

**请求参数：** 无

**响应格式：**

```typescript
interface ClearResponse {
  code: 0;                          // 状态码，0表示成功
  msg: string;                      // 操作结果消息
}
```

**响应示例：**

```json
{
  "code": 0,
  "msg": "Statistics have been cleared!"
}
```

### 3. 静态资源服务

**端点：** `GET /`、`GET /public/*`

**描述：** 提供Web界面的静态文件服务，包括HTML、CSS、JavaScript等资源。

**请求参数：** 路径参数

**响应格式：** 对应的静态文件内容

## 实时数据更新机制

### 1. 数据采集

- **抓包周期：** 实时网络包捕获
- **数据处理：** 100ms间隔处理TCP包
- **协议解析：** 自动解析游戏Protocol Buffers数据

### 2. 统计计算

- **实时DPS计算：** 基于1秒滑动窗口
- **总体DPS计算：** 总伤害 ÷ 战斗持续时间
- **暴击率计算：** 暴击次数 ÷ 总次数
- **幸运率计算：** 幸运次数 ÷ 总次数

### 3. 数据更新频率

- **实时统计更新：** 100ms间隔
- **Web界面建议轮询频率：** 100-500ms
- **数据持久化：** 内存存储，服务重启后清空

## 错误处理

### HTTP状态码

- `200 OK`: 请求成功
- `404 Not Found`: 端点不存在
- `500 Internal Server Error`: 服务器内部错误

### 错误响应格式

当发生错误时，API可能返回包含错误信息的响应：

```json
{
  "code": 1,
  "error": "错误描述",
  "message": "详细错误信息"
}
```

## 客户端集成指南

### 1. 数据轮询

```typescript
// 推荐的数据获取方式
const fetchData = async () => {
  try {
    const response = await fetch('http://localhost:8989/api/data');
    const data: DataResponse = await response.json();
    
    if (data.code === 0) {
      // 处理用户数据
      Object.entries(data.user).forEach(([uid, userData]) => {
        console.log(`用户 ${uid} 当前DPS: ${userData.realtime_dps}`);
      });
    }
  } catch (error) {
    console.error('获取数据失败:', error);
  }
};

// 设置定时轮询
setInterval(fetchData, 200); // 200ms轮询
```

### 2. 清空数据

```typescript
const clearStats = async () => {
  try {
    const response = await fetch('http://localhost:8989/api/clear');
    const result: ClearResponse = await response.json();
    
    if (result.code === 0) {
      console.log('统计数据已清空');
    }
  } catch (error) {
    console.error('清空数据失败:', error);
  }
};
```

### 3. 连接检测

```typescript
const checkConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:8989/api/data', {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch {
    return false;
  }
};
```

## 性能与优化

### 1. 客户端优化建议

- **合理的轮询频率：** 推荐100-500ms，避免过于频繁的请求
- **错误处理：** 实现重试机制和连接检测
- **数据缓存：** 对静态数据进行客户端缓存
- **增量更新：** 比较数据变化，只更新必要的UI组件

### 2. 服务器性能特征

- **内存使用：** 约50-100MB（取决于用户数量和战斗时长）
- **CPU使用：** 低负载（主要在网络包处理时）
- **网络带宽：** 极低（仅本地HTTP请求）
- **并发支持：** 支持多个客户端同时连接

### 3. 数据量估算

- **单用户数据大小：** 约1-2KB JSON
- **10用户数据大小：** 约10-20KB JSON
- **建议最大轮询频率：** 不超过10次/秒

## 注意事项

### 1. 服务可用性

- 确保游戏正在运行且已连接服务器
- 确保选择了正确的网络设备进行抓包
- 服务器检测到游戏连接后才开始提供数据

### 2. 数据准确性

- 数据基于网络包解析，准确性取决于网络稳定性
- 在网络环境稳定的情况下，数据准确性已经过多次验证
- 建议在人群密集度较低的区域进行测试以获得更稳定的数据

### 3. 安全考虑

- 服务仅在本地运行（localhost）
- 不收集任何个人敏感信息
- 仅分析游戏战斗数据包，不修改游戏客户端

## 兼容性说明

### 支持的环境

- **操作系统：** Windows（需要WinPcap/Npcap）
- **Node.js版本：** >= 22.15.0
- **包管理器：** pnpm >= 10.13.1
- **浏览器：** 现代浏览器（支持ES6+）

### 依赖要求

- **网络抓包驱动：** WinPcap 或 Npcap
- **编译工具：** Visual Studio Build Tools
- **Python：** Python 3.10（用于编译原生模块）


---

## 补充

职业列表

```
冰魔法师		射线
冰魔法师		冰矛
灵魂乐手		协奏
灵魂乐手		狂音
森语者		愈合
森语者		惩戒
雷影剑士		居合
雷影剑士		月刃
神射手		鹰弓
神射手		狼弓
青岚骑士		空枪
青岚骑士		重装
神盾骑士		防盾
神盾骑士		光盾
巨刃守护者	岩盾
巨刃守护者	格挡	
```

```
射线		C	法
冰矛		C	法
居合		C	近
月刃		C	近
空枪		C	近
重装		C	近
鹰弓		C	远
狼弓		C	远
防盾		T	坦
光盾		T	坦
岩盾		T	坦
格挡		T	坦
协奏		N	辅
狂音		N	辅
愈合		N	奶
惩戒		N	奶
```

---

*此API规范基于StarResonanceDamageCounter v2.2.1版本，可能随版本更新而变化。*
