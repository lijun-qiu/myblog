---
title: vue3
date: 2023-05-19
tags:
 - vue3
categories:
 - vue3区别于vue2
---
# 1.vue3兄弟组件传值
创建 EventBus
EventBus.js
```js
import Vue from 'vue'
export const EventBus = new Vue()
```

使用 EventBus
假设有两个组件需要通信：ComponentA 和 ComponentB
组件 A (发送事件)

ComponentA.vue
```js
<template>
  <div>
    <button @click="sendMessage">发送消息到组件B</button>
  </div>
</template>

<script>
import { EventBus } from '../utils/EventBus'

export default {
  name: 'ComponentA',
  methods: {
    sendMessage() {
      // 发送事件，传递数据
      EventBus.$emit('message-from-a', {
        text: 'Hello from Component A',
        timestamp: new Date().getTime()
      })
    }
  }
}
</script>
```

组件 B (接收事件)

ComponentB.vue
```js
<template>
  <div>
    <p v-if="message">收到消息: {{ message.text }}</p>
    <p v-if="message">时间戳: {{ message.timestamp }}</p>
  </div>
</template>

<script>
import { EventBus } from '../utils/EventBus'

export default {
  name: 'ComponentB',
  data() {
    return {
      message: null
    }
  },
  created() {
    // 监听事件
    EventBus.$on('message-from-a', data => {
      this.message = data
      console.log('收到消息', data)
    })
  },
  beforeDestroy() {
    // 组件销毁前移除事件监听
    EventBus.$off('message-from-a')
  }
}
</script>
```

Vue3 mitt 案例
在 Vue3 中，官方不再推荐使用 EventBus 模式，可以使用 mitt 库来实现类似功能。

创建一个 eventBus.js 文件：
eventBus.js
```js
import mitt from 'mitt'
const emitter = mitt()
export default emitter
```

在组件 A 中：
```js
<template>
  <div>
    <button @click="sendMessage">发送消息到组件B</button>
  </div>
</template>

<script setup>
import emitter from '../utils/eventBus'

function sendMessage() {
  // 发送事件和数据
  emitter.emit('message-from-a', {
    text: 'Hello from Component A with mitt',
    timestamp: new Date().getTime()
  })
}
</script>
```

在组件 B 中：
```js
<template>
  <div>
    <p v-if="message">收到消息: {{ message.text }}</p>
    <p v-if="message">时间戳: {{ message.timestamp }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import emitter from '../utils/eventBus'

const message = ref(null)

// 事件处理函数
function handleMessage(data) {
  message.value = data
  console.log('mitt收到消息', data)
}

// 组件挂载时添加事件监听
onMounted(() => {
  emitter.on('message-from-a', handleMessage)
})

// 组件卸载前移除事件监听，避免内存泄漏
onBeforeUnmount(() => {
  emitter.off('message-from-a', handleMessage)
})
</script>
```
比起 Vue 实例上的 EventBus，mitt.js 好在哪里呢？

1.首先它足够小，仅有200bytes。  
2.其次支持全部事件的监听和批量移除。  
3.它还不依赖 Vue 实例，可以跨框架使用，React 或者 Vue，甚至 jQuery 项目都能使用同一套库。  


## 其他方法
1. 使用响应式状态（Composition API）
可以创建一个共享的响应式状态，供多个组件使用：
useSharedState.js
```js
import { ref, reactive } from 'vue'

export function useSharedState() {
  // 使用ref或reactive创建响应式状态
  const message = ref(null)
  
  function updateMessage(newMessage) {
    message.value = newMessage
  }

  return {
    message,
    updateMessage
  }
}
```

组件A（发送方）：
```js
<template>
  <div>
    <button @click="sendMessage">发送消息到组件B</button>
  </div>
</template>

<script setup>
import { useSharedState } from '../composables/useSharedState'

const { updateMessage } = useSharedState()

function sendMessage() {
  updateMessage({
    text: 'Hello from Component A via shared state',
    timestamp: new Date().getTime()
  })
}
</script>
```

组件B（接收方）：
```js
<template>
  <div>
    <p v-if="message">收到消息: {{ message.text }}</p>
    <p v-if="message">时间戳: {{ message.timestamp }}</p>
  </div>
</template>

<script setup>
import { useSharedState } from '../composables/useSharedState'

const { message } = useSharedState()
</script>
```
2. 使用 provide/inject
这是Vue3中非常强大的特性，适合深层组件通信：

APP.vue
```js
<template>
  <div id="app">
    <h1>Vue3 Provide/Inject 示例</h1>
    <div class="container">
      <ComponentA />
      <ComponentB />
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import ComponentA from './components/ComponentA.vue'
import ComponentB from './components/ComponentB.vue'

// 创建响应式状态
const sharedMessage = ref(null)

// 提供值和更新方法
provide('sharedMessage', sharedMessage)
provide('updateMessage', (newMessage) => {
  sharedMessage.value = newMessage
})
</script>
```

组件A（发送方）：
```js
<template>
  <div>
    <button @click="sendMessage">发送消息到组件B</button>
  </div>
</template>

<script setup>
import { inject } from 'vue'

// 注入更新方法
const updateMessage = inject('updateMessage')

function sendMessage() {
  updateMessage({
    text: 'Hello from Component A via provide/inject',
    timestamp: new Date().getTime()
  })
}
</script>
```

组件B（接收方）：
```js
<template>
  <div>
    <p v-if="sharedMessage">收到消息: {{ sharedMessage.text }}</p>
    <p v-if="sharedMessage">时间戳: {{ sharedMessage.timestamp }}</p>
  </div>
</template>

<script setup>
import { inject } from 'vue'

// 注入共享消息
const sharedMessage = inject('sharedMessage')
</script>
```
对比与推荐  
响应式共享状态:  
优点：简单，不需要额外库  
缺点：单例模式，适合小型应用  
Provide/Inject:  
优点：内置于Vue3，避免prop drilling  
缺点：可能使组件间隐式依赖，调试较难  
Pinia:  
优点：状态集中管理，支持Devtools，易于扩展  
缺点：小型应用可能有点重  
4. mitt:  
优点：解耦组件，实现发布订阅  
缺点：事件管理复杂，容易导致混乱  
推荐选择  
小型应用：使用响应式共享状态或provide/inject  
中大型应用：使用Pinia  
特定场景（如一次性通知）：使用mitt  
选择方案时，考虑应用规模、团队熟悉度和维护成本是关键因素。对于大多数Vue3应用，Pinia是目前最推荐的状态管理解决方案。  

# 2.vue3用什么取代vue2的$set
在 Vue2 中，我们需要使用 Vue.$set 或 this.$set 来确保新添加的对象属性是响应式的，因为 Vue2 使用 Object.defineProperty 实现响应式，它无法检测对象属性的添加或删除。  
1. Vue3 的响应式解决方案  
Vue3 使用 Proxy 替代了 Object.defineProperty，Proxy 能够拦截对象的所有操作（包括添加和删除属性），因此大多数情况下不再需要 $set。直接赋值即可

2. 使用 toRefs/toRef
当需要解构响应式对象但保持响应性时：
```js
const user = reactive({
  name: '张三',
  age: 25
})

// 使用 toRefs 解构但保持响应性
const { name, age } = toRefs(user)

function updateName() {
  // 这样修改仍然是响应式的
  name.value = '李四'
}
```

# 3.components组件的使用方法和属性介绍
Vue 内置 component 组件详解  
component 是 Vue 提供的一个内置组件，用于动态渲染组件。它可以根据传入的组件名或组件对象动态切换渲染不同的组件。  
基本属性  
1. is 属性（核心属性）  
is 是 component 组件最重要的属性，它决定了要渲染的实际组件。  

```js
<component :is="currentComponent"></component>
```
is 属性可以接收以下几种类型的值：  
组件名字符串：对应已注册的组件名  
组件对象：导入的组件对象  
HTML 元素名：如 'div', 'button' 等  
异步组件：由 defineAsyncComponent 定义的组件  
基本用法
```js
<template>
  <div>
    <button 
      v-for="tab in tabs" 
      :key="tab.name"
      @click="currentTab = tab.name"
      :class="{ active: currentTab === tab.name }"
    >
      {{ tab.label }}
    </button>
    
    <component :is="currentTab"></component>
  </div>
</template>

<script>
import TabA from './TabA.vue'
import TabB from './TabB.vue'
import TabC from './TabC.vue'

export default {
  components: {
    TabA,
    TabB,
    TabC
  },
  data() {
    return {
      currentTab: 'TabA',
      tabs: [
        { name: 'TabA', label: '标签A' },
        { name: 'TabB', label: '标签B' },
        { name: 'TabC', label: '标签C' }
      ]
    }
  }
}
</script>
```

配合 keep-alive 使用  
当使用 component 动态切换组件时，默认情况下，组件会被销毁并重新创建。如果希望保持组件状态，可以配合 keep-alive 使用：
```js
<template>
  <div>
    <button 
      v-for="tab in tabs" 
      :key="tab.name"
      @click="currentTab = tab.name"
    >
      {{ tab.label }}
    </button>
    
    <keep-alive>
      <component :is="currentTab"></component>
    </keep-alive>
  </div>
</template>

<script>
// ...组件代码
</script>
```
keep-alive 的属性  
在使用<keep-alive 时，可以通过属性控制缓存的组件：  
```js
<keep-alive :include="['ComponentA', 'ComponentB']" :exclude="['ComponentC']" :max="5">
  <component :is="currentComponent"></component>
</keep-alive>
```

渲染HTML元素
component 也可以渲染普通HTML元素：
```js
<template>
  <div>
    <button @click="currentElement = 'div'">渲染DIV</button>
    <button @click="currentElement = 'span'">渲染SPAN</button>
    <button @click="currentElement = 'p'">渲染P</button>
    
    <component :is="currentElement" class="dynamic-element">
      这是一个动态渲染的HTML元素
    </component>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentElement: 'div'
    }
  }
}
</script>
```
结合异步组件
```js
<template>
  <div>
    <button @click="loadHeavyComponent">加载大型组件</button>
    
    <component :is="asyncComponent"></component>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import LoadingComponent from './LoadingComponent.vue'
import ErrorComponent from './ErrorComponent.vue'

export default {
  data() {
    return {
      asyncComponent: null
    }
  },
  methods: {
    loadHeavyComponent() {
      this.asyncComponent = defineAsyncComponent({
        loader: () => import('./HeavyComponent.vue'),
        loadingComponent: LoadingComponent,
        errorComponent: ErrorComponent,
        delay: 200,
        timeout: 3000
      })
    }
  }
}
</script>
```
传递Props和监听事件
component 可以像普通组件一样传递props和监听事件：
```js
<template>
  <div>
    <button 
      v-for="tab in tabs" 
      :key="tab.name"
      @click="currentTab = tab.name"
    >
      {{ tab.label }}
    </button>
    
    <component 
      :is="currentTab"
      :user="user"
      :settings="settings"
      @update:user="updateUser"
      @action="handleAction"
    ></component>
  </div>
</template>

<script>
export default {
  // ...组件代码
  data() {
    return {
      currentTab: 'UserProfile',
      user: { id: 1, name: 'John' },
      settings: { theme: 'dark' }
    }
  },
  methods: {
    updateUser(newUser) {
      this.user = newUser
    },
    handleAction(actionData) {
      console.log('Action triggered:', actionData)
    }
  }
}
</script>
```
使用插槽
component 组件可以包含插槽内容，这些内容会传递给渲染的实际组件：
```js
<template>
  <div>
    <button @click="currentLayout = 'LayoutA'">布局A</button>
    <button @click="currentLayout = 'LayoutB'">布局B</button>
    
    <component :is="currentLayout">
      <!-- 默认插槽 -->
      <p>这是主要内容</p>
      
      <!-- 具名插槽 -->
      <template #header>
        <h2>标题区域</h2>
      </template>
      
      <template #footer>
        <div>底部区域</div>
      </template>
    </component>
  </div>
</template>

<script>
import LayoutA from './layouts/LayoutA.vue'
import LayoutB from './layouts/LayoutB.vue'

export default {
  components: {
    LayoutA,
    LayoutB
  },
  data() {
    return {
      currentLayout: 'LayoutA'
    }
  }
}
</script>
```

与 v-bind="$attrs" 结合使用
在不确定传递什么属性的情况下，可以结合 v-bind="$attrs" 使用：
```js
<template>
  <div>
    <component 
      :is="componentType" 
      v-bind="$attrs"
    ></component>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    componentType: {
      type: String,
      required: true
    }
  }
}
</script>
```
使用注意事项  
组件切换时的生命周期：  
默认情况下，切换组件会触发旧组件的销毁和新组件的创建  
使用 keep-alive 可以保持状态，此时会触发 activated 和 deactivated 生命周期钩子  
动态组件的 key：  
如果需要强制重新创建组件，可以使用 key 属性  
```js
 <component :is="currentComp" :key="componentKey"></component>
```
总结来说，component 是 Vue 中实现动态组件的强大工具，结合 is 属性和 keep-alive，可以灵活地控制组件的动态渲染和状态保持。

# 4.Vue Watch API 详解
Watch API 的几种方法  
1. watchEffect()  
执行时机：立即执行，并自动追踪内部响应式依赖  
特点：  
第一个参数是一个副作用函数，会立即执行并建立依赖追踪  
当依赖变化时，副作用函数会重新执行  
不需要明确指定要监听的数据  
2. watchPostEffect()  
本质上是 watchEffect() 使用 flush: 'post' 选项的别名  
执行时机：组件更新后执行，可以访问更新后的 DOM  
3. watchSyncEffect()  
本质上是 watchEffect() 使用 flush: 'sync' 选项的别名  
执行时机：同步执行，依赖变化时立即触发  
4. watch()  
特点：  
侦听一个或多个响应式数据源，并在数据源变化时调用回调函数  
更明确地控制什么状态应该触发侦听器重新运行  
可以访问被侦听状态的前一个值和当前值  
配置选项说明  
参数：  
参数1：要监听的响应式数据源  
参数2：当数据源变化时要调用的回调函数  
参数3：可选配置，支持 immediate、deep、flush、onTrack、onTrigger 等选项  
immediate: 设置为 true 时，侦听器创建时立即执行一次  
deep: 设置为 true 时，深度监听对象内部的变化  
flush: 控制回调的调用时机  
'pre'：组件更新前调用（默认）  
'post'：组件更新后调用  
'sync'：同步调用  
onTrack/onTrigger: 用于调试，跟踪依赖收集和触发过程  
```js
   // 明确指定要监听的属性，并使用调试选项
    watch(
      // 指定监听 user.name 和 user.profile.age
      [() => user.name, () => user.profile.age, counter],
      ([newName, newAge, newCounter], [oldName, oldAge, oldCounter]) => {
        console.log(`名字: ${oldName} -> ${newName}`)
        console.log(`年龄: ${oldAge} -> ${newAge}`)
        console.log(`计数器: ${oldCounter} -> ${newCounter}`)
      },
      {
        // 调试选项
        onTrack(event) {
          // 这里会显示具体追踪了哪个属性
          console.log('追踪依赖:', event.target, event.key)
        },
        onTrigger(event) {
          // 这里会显示具体是哪个属性的变化触发了回调
          console.log('触发更新:', event.target, event.key, 
                     `${event.oldValue} -> ${event.newValue}`)
        }
      }
    )
    
```
使用场景  
watchEffect: 适合简单的副作用逻辑，不需要区分旧值和新值  
```js
// watchEffect 会自动追踪内部使用的响应式属性
watchEffect(() => {
  console.log(`Count: ${count.value}, Name: ${name.value}`)
  // 这里会自动追踪 count 和 name
})
```
watchPostEffect: 需要在 DOM 更新后执行操作时使用  
watchSyncEffect: 需要立即响应数据变化时使用  
watch: 需要比较数据变化前后的值，或需要更精确控制监听行为时使用  
这些 API 为 Vue 应用提供了灵活的响应式数据监听能力，可以根据不同的场景选择最合适的方法。  