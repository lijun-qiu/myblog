---
title: Vue 3 computed与watch
date: 2025-08-19
tags:
 - vue3
categories:
 - Vue 3 computed与watch
---
# Vue 3 computed与watch

## �� 目录
- [Watch 的实现原理](#watch-的实现原理)
- [Watch 与计算属性的区别](#watch-与计算属性的区别)
- [ReactiveEffect 核心概念](#reactiveeffect-核心概念)
- [实际应用场景对比](#实际应用场景对比)
- [性能对比](#性能对比)
- [高级用法](#高级用法)
- [总结](#总结)

---

## �� Watch 的实现原理

### 1. 基本实现机制

`watch` 基于 `ReactiveEffect` 系统实现，与计算属性共享相同的底层机制：

```js
// 简化的 watch 实现
function watch(source, callback, options = {}) {
  let getter
  
  // 处理不同类型的 source
  if (typeof source === 'function') {
    getter = source
  } else if (isRef(source)) {
    getter = () => source.value
  } else if (isReactive(source)) {
    getter = () => source
  }
  
  let oldValue, newValue
  
  const job = () => {
    newValue = effect.run()
    callback(newValue, oldValue)
    oldValue = newValue
  }
  
  const effect = new ReactiveEffect(getter, job)
  
  // 立即执行一次（如果设置了 immediate）
  if (options.immediate) {
    job()
  } else {
    oldValue = effect.run()
  }
  
  return () => effect.stop()
}
```

### 2. 依赖追踪过程

```js
const count = ref(0)
const multiplier = ref(2)

// watch 会追踪 count 的变化
watch(count, (newVal, oldVal) => {
  console.log(`count 从 ${oldVal} 变为 ${newVal}`)
})

// 当 count 变化时，回调函数会被调用
count.value = 5 // 输出: count 从 0 变为 5
```

### 3. 深度监听实现

```js
// 深度监听对象
const state = reactive({ user: { name: 'John', age: 25 } })

watch(
  state,
  (newVal, oldVal) => {
    console.log('state 发生了变化')
  },
  { deep: true } // 深度监听
)

// 修改嵌套属性也会触发
state.user.name = 'Jane' // 触发 watch
```

---

## ⚖️ Watch 与计算属性的区别

### 1. 用途和目的

#### 计算属性 (computed)
- **目的**：基于依赖计算出一个新值
- **特点**：有返回值，用于模板渲染
- **缓存**：有缓存机制

```js
const firstName = ref('John')
const lastName = ref('Doe')

// 计算属性：计算出一个新值
const fullName = computed(() => {
  return firstName.value + ' ' + lastName.value
})
```

#### Watch
- **目的**：监听数据变化，执行副作用
- **特点**：没有返回值，用于执行操作
- **缓存**：没有缓存，每次变化都执行

```js
const count = ref(0)

// watch：监听变化，执行副作用
watch(count, (newVal, oldVal) => {
  console.log(`计数变化: ${oldVal} -> ${newVal}`)
  // 可以执行 API 调用、DOM 操作等副作用
})
```

### 2. 执行时机

#### 计算属性
- 惰性执行：只有被访问时才计算
- 依赖变化时重新计算

```js
const expensiveValue = computed(() => {
  console.log('计算属性执行了')
  return heavyCalculation()
})

// 只有访问时才执行
console.log(expensiveValue.value) // 执行
console.log(expensiveValue.value) // 不执行，返回缓存
```

#### Watch
- 立即执行：依赖变化时立即执行回调
- 可以设置 `immediate: true` 立即执行一次

```js
watch(count, (newVal) => {
  console.log('watch 执行了')
  // 每次 count 变化都会执行
}, { immediate: true })
```

### 3. 返回值

#### 计算属性
```js
const result = computed(() => {
  return someCalculation()
})

// 有返回值
console.log(result.value) // 有值
```

#### Watch
```js
watch(count, (newVal) => {
  // 没有返回值，只是执行副作用
  doSomething()
})

// 返回停止监听的函数
const stop = watch(count, callback)
stop() // 停止监听
```

---

## 🧠 ReactiveEffect 核心概念

### 什么是 ReactiveEffect？

`ReactiveEffect` 是 Vue 3 响应式系统的**核心执行单元**，它代表一个**副作用函数**（side effect）。简单来说，它就是一个**可追踪的函数**，当它依赖的响应式数据发生变化时，这个函数会被重新执行。

### 基本概念

#### 1. 副作用（Side Effect）
副作用是指除了返回值之外，还会对外部环境产生影响的操作，比如：
- DOM 操作
- API 调用
- 控制台输出
- 文件读写

#### 2. ReactiveEffect 的作用
`ReactiveEffect` 将这些副作用函数包装起来，让它们能够：
- 自动追踪依赖的响应式数据
- 在依赖变化时自动重新执行
- 管理执行时机和调度

### 简化实现

```js
// 全局变量，用于追踪当前正在执行的 effect
let activeEffect = null

// 依赖收集的存储结构
const targetMap = new WeakMap()

class ReactiveEffect {
  constructor(fn, options = {}) {
    this.fn = fn // 要执行的函数
    this.deps = [] // 依赖的响应式数据集合
    this.active = true // 是否激活
    this.scheduler = options.scheduler // 调度器
  }

  // 执行 effect
  run() {
    if (!this.active) return this.fn()
    
    // 设置当前活跃的 effect
    const prevActiveEffect = activeEffect
    activeEffect = this
    
    try {
      // 执行函数，在这个过程中会收集依赖
      return this.fn()
    } finally {
      // 恢复之前的活跃 effect
      activeEffect = prevActiveEffect
    }
  }

  // 停止 effect
  stop() {
    if (this.active) {
      this.active = false
      // 从所有依赖中移除自己
      this.deps.forEach(dep => dep.delete(this))
      this.deps.length = 0
    }
  }
}

// 依赖收集
function track(target, key) {
  if (!activeEffect) return
  
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

// 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  const dep = depsMap.get(key)
  if (dep) {
    dep.forEach(effect => {
      if (effect.scheduler) {
        effect.scheduler()
      } else {
        effect.run()
      }
    })
  }
}

// 创建 effect
function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn, options)
  
  if (!options.lazy) {
    _effect.run()
  }
  
  return _effect
}
```

### 核心机制

#### 1. 依赖收集过程
```js
const count = ref(0)

effect(() => {
  // 1. 设置 activeEffect 为当前 effect
  // 2. 执行 console.log(count.value)
  // 3. count.value 触发 getter
  // 4. getter 调用 track，收集当前 activeEffect
  // 5. 将 effect 添加到 count 的依赖集合中
  console.log(count.value)
})
```

#### 2. 触发更新过程
```js
count.value = 1

// 1. count.value 触发 setter
// 2. setter 调用 trigger
// 3. trigger 找到 count 的依赖集合
// 4. 遍历依赖集合，执行每个 effect
// 5. effect 重新执行，输出新的值
```

---

## 🎯 实际应用场景对比

### 1. 计算属性适用场景

#### 数据转换和计算
```js
const items = ref([
  { name: 'Apple', price: 10, quantity: 2 },
  { name: 'Banana', price: 5, quantity: 3 }
])

// 计算总价 - 适合用计算属性
const totalPrice = computed(() => {
  return items.value.reduce((sum, item) => {
    return sum + (item.price * item.quantity)
  }, 0)
})
```

#### 条件判断
```js
const user = ref({ age: 25, isVip: true })

// 判断用户权限 - 适合用计算属性
const canAccessPremium = computed(() => {
  return user.value.age >= 18 && user.value.isVip
})
```

### 2. Watch 适用场景

#### API 调用
```js
const userId = ref(1)

// 监听用户ID变化，调用API - 适合用 watch
watch(userId, async (newId) => {
  try {
    const userData = await fetchUser(newId)
    // 处理用户数据
  } catch (error) {
    console.error('获取用户数据失败:', error)
  }
})
```

#### DOM 操作
```js
const isVisible = ref(false)

// 监听显示状态，操作DOM - 适合用 watch
watch(isVisible, (visible) => {
  if (visible) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
  }
})
```

#### 本地存储
```js
const settings = ref({ theme: 'dark', language: 'zh' })

// 监听设置变化，保存到本地存储 - 适合用 watch
watch(settings, (newSettings) => {
  localStorage.setItem('settings', JSON.stringify(newSettings))
}, { deep: true })
```

---

## ⚡ 性能对比

### 1. 计算属性性能优势

```js
const expensiveValue = computed(() => {
  return heavyCalculation() // 只有依赖变化时才执行
})

// 多次访问不会重复计算
console.log(expensiveValue.value) // 执行一次
console.log(expensiveValue.value) // 直接返回缓存
```

### 2. Watch 性能考虑

```js
const count = ref(0)

// 每次变化都执行，没有缓存
watch(count, (newVal) => {
  heavyOperation() // 每次 count 变化都执行
})

// 可以使用防抖优化
watch(count, debounce((newVal) => {
  heavyOperation() // 防抖后执行
}, 300))
```

---

## 🚀 高级用法

### 1. 监听多个源

```js
const firstName = ref('John')
const lastName = ref('Doe')

// 监听多个响应式数据
watch([firstName, lastName], ([newFirst, newLast], [oldFirst, oldLast]) => {
  console.log(`姓名变化: ${oldFirst} ${oldLast} -> ${newFirst} ${newLast}`)
})
```

### 2. 条件监听

```js
const user = ref(null)
const isLoggedIn = ref(false)

// 只在用户登录时监听
watch(user, (newUser) => {
  if (isLoggedIn.value) {
    // 执行相关操作
  }
})
```

### 3. 异步操作

```js
const searchQuery = ref('')

// 异步搜索
watch(searchQuery, async (query) => {
  if (query.length < 2) return
  
  try {
    const results = await searchAPI(query)
    // 处理搜索结果
  } catch (error) {
    console.error('搜索失败:', error)
  }
})
```

### 4. 调度机制

```js
const count = ref(0)

// 使用调度器
const effect1 = effect(() => {
  console.log('count 的值是:', count.value)
}, {
  scheduler: (effect) => {
    // 异步执行
    setTimeout(() => {
      effect.run()
    }, 100)
  }
})

count.value = 1 // 不会立即执行，100ms 后执行
```

### 5. 生命周期管理

```js
const count = ref(0)

const effect1 = effect(() => {
  console.log('count 的值是:', count.value)
})

// 停止 effect
effect1.stop()

count.value = 1 // 不会执行，因为 effect 已停止
```

---

## 🔧 在 Vue 3 中的应用

### 1. 计算属性
```js
const count = ref(0)

const doubled = computed(() => {
  return count.value * 2
})

// computed 内部使用 ReactiveEffect
// 当 count 变化时，doubled 会自动重新计算
```

### 2. Watch
```js
const count = ref(0)

watch(count, (newVal, oldVal) => {
  console.log(`count 从 ${oldVal} 变为 ${newVal}`)
})

// watch 内部使用 ReactiveEffect
// 当 count 变化时，回调函数会自动执行
```

### 3. WatchEffect
```js
const count = ref(0)

watchEffect(() => {
  console.log('count 的值是:', count.value)
})

// watchEffect 内部使用 ReactiveEffect
// 当 count 变化时，effect 会自动重新执行
```

---

## 📝 总结

### 选择原则

#### 使用计算属性 (computed) 当：
- ✅ 需要基于依赖计算出一个新值
- ✅ 需要缓存结果避免重复计算
- ✅ 用于模板渲染
- ✅ 纯函数，没有副作用

#### 使用 Watch 当：
- ✅ 需要监听数据变化执行副作用
- ✅ 需要调用 API、操作 DOM
- ✅ 需要保存数据到本地存储
- ✅ 需要执行异步操作

### 性能考虑
- **计算属性**：有缓存，性能更好
- **Watch**：每次变化都执行，需要合理使用防抖/节流

### ReactiveEffect 的作用

`ReactiveEffect` 是 Vue 3 响应式系统的**核心执行单元**，它：

1. **包装副作用函数**：将普通的副作用函数包装成可追踪的 effect
2. **自动依赖收集**：在执行过程中自动收集依赖的响应式数据
3. **自动触发更新**：当依赖变化时自动重新执行
4. **支持调度控制**：可以控制执行时机和方式
5. **生命周期管理**：可以启动、停止 effect

它让 Vue 3 的响应式系统能够：
- 自动追踪依赖关系
- 精确更新相关组件
- 避免不必要的重复计算
- 提供灵活的调度机制

### 核心要点

> **两者都基于相同的响应式系统，但用途不同：计算属性用于计算，Watch 用于监听。这就是为什么 Vue 3 能够实现如此高效和精确的响应式更新的根本原因。**

---

## 📚 相关资源

- [Vue 3 官方文档 - 响应式基础](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [Vue 3 官方文档 - 计算属性](https://cn.vuejs.org/guide/essentials/computed.html)
- [Vue 3 官方文档 - 侦听器](https://cn.vuejs.org/guide/essentials/watchers.html)
- [Vue 3 源码仓库](https://github.com/vuejs/vue-next)

---