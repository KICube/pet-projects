<script setup>
import { ref, computed } from 'vue'

const display = ref('0')
const previousValue = ref(null)
const operation = ref(null)
const waitingForOperand = ref(false)
const memory = ref(0)
const history = ref([])
const historyIndex = ref(-1)
const displayKey = ref(0)

function inputDigit(digit) {
  if (waitingForOperand.value) {
    display.value = digit
    waitingForOperand.value = false
  } else {
    display.value = display.value === '0' ? digit : display.value + digit
  }
  displayKey.value++
}

function inputDot() {
  if (waitingForOperand.value) {
    display.value = '0.'
    waitingForOperand.value = false
    displayKey.value++
    return
  }
  if (!display.value.includes('.')) {
    display.value += '.'
    displayKey.value++
  }
}

function clear() {
  display.value = '0'
  previousValue.value = null
  operation.value = null
  waitingForOperand.value = false
  displayKey.value++
}

function backspace() {
  if (waitingForOperand.value) return
  display.value = display.value.length > 1 ? display.value.slice(0, -1) : '0'
  displayKey.value++
}

function performOperation(nextOperation) {
  const inputValue = parseFloat(display.value)

  if (previousValue.value === null) {
    previousValue.value = inputValue
  } else if (operation.value) {
    const result = calculate(previousValue.value, inputValue, operation.value)
    display.value = String(result)
    previousValue.value = result
  }

  waitingForOperand.value = true
  operation.value = nextOperation
  displayKey.value++
}

function calculate(first, second, op) {
  switch (op) {
    case '+': return first + second
    case '-': return first - second
    case '*': return first * second
    case '/': return second !== 0 ? first / second : 'Ошибка'
    default: return second
  }
}

function equals() {
  if (operation.value === null || previousValue.value === null) return

  const inputValue = parseFloat(display.value)
  const result = calculate(previousValue.value, inputValue, operation.value)

  const expression = `${previousValue.value} ${operation.value} ${inputValue} = ${result}`
  history.value.push(expression)
  historyIndex.value = history.value.length

  display.value = String(result)
  previousValue.value = null
  operation.value = null
  waitingForOperand.value = true
  displayKey.value++
}

function memoryClear() {
  memory.value = 0
}

function memoryRecall() {
  display.value = String(memory.value)
  waitingForOperand.value = true
  displayKey.value++
}

function memoryAdd() {
  memory.value += parseFloat(display.value) || 0
}

function memorySubtract() {
  memory.value -= parseFloat(display.value) || 0
}

function goToHistory(index) {
  if (index >= 0 && index < history.value.length) {
    const entry = history.value[index]
    const parts = entry.split(' = ')
    if (parts.length === 2) {
      display.value = parts[1]
      historyIndex.value = index
      displayKey.value++
    }
  }
}

function goBack() {
  if (historyIndex.value > 0) {
    historyIndex.value--
    goToHistory(historyIndex.value)
  } else if (historyIndex.value === 0) {
    historyIndex.value = -1
    display.value = '0'
    displayKey.value++
  }
}

function goForward() {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    goToHistory(historyIndex.value)
  }
}

const currentExpression = computed(() => {
  if (operation.value && previousValue.value !== null) {
    return `${previousValue.value} ${operation.value}`
  }
  return ''
})

const isMemoryActive = computed(() => memory.value !== 0)
</script>

<template>
  <div class="min-h-dvh bg-[#11111b] flex flex-col">
    <header class="px-4 pt-6 pb-4 text-center flex-none animate-fade-in-up">
      <h1 class="text-2xl sm:text-3xl font-bold text-[#cdd6f4] tracking-tight">
        Калькулятор с памятью
      </h1>
      <p class="mt-1 text-xs sm:text-sm text-[#a6adc8]">
        история, память и навигация по шагам
      </p>
    </header>

    <div class="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 px-4 sm:px-6 pb-4 sm:pb-6 min-h-0">
      <main class="flex-1 lg:flex-[2] min-w-0 bg-calc-bg rounded-2xl sm:rounded-3xl shadow-2xl border border-calc-border p-4 sm:p-6 flex flex-col min-h-0 overflow-hidden animate-scale-in">
        <div class="bg-calc-history rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5">
          <div class="text-xs sm:text-sm text-calc-text-muted mb-1 truncate">{{ currentExpression || '\u00A0' }}</div>
          <div :key="displayKey" class="display-enter text-right text-2xl sm:text-3xl font-mono text-calc-text break-all leading-tight">
            {{ display }}
          </div>
        </div>

        <div class="grid grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <button
            @click="memoryClear"
            :disabled="!isMemoryActive"
            class="calc-btn py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-calc-memory text-calc-bg font-semibold hover:bg-calc-memory-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
          >
            MC
          </button>
          <button
            @click="memoryRecall"
            class="calc-btn py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-calc-memory text-calc-bg font-semibold hover:bg-calc-memory-hover transition-colors text-xs sm:text-sm"
          >
            MR
          </button>
          <button
            @click="memoryAdd"
            class="calc-btn py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-calc-memory text-calc-bg font-semibold hover:bg-calc-memory-hover transition-colors text-xs sm:text-sm"
          >
            M+
          </button>
          <button
            @click="memorySubtract"
            class="calc-btn py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-calc-memory text-calc-bg font-semibold hover:bg-calc-memory-hover transition-colors text-xs sm:text-sm"
          >
            M-
          </button>
        </div>

        <div class="flex-1 grid grid-cols-4 grid-rows-5 gap-2 sm:gap-3 min-h-0">
          <button
            @click="clear"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-clear text-calc-bg font-bold text-base sm:text-lg hover:bg-calc-clear-hover transition-colors"
          >
            C
          </button>
          <button
            @click="backspace"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-surface text-calc-text font-bold text-base sm:text-lg hover:bg-calc-surface-hover transition-colors"
          >
            ⌫
          </button>
          <button
            @click="performOperation('%')"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-operator text-calc-bg font-bold text-base sm:text-lg hover:bg-calc-operator-hover transition-colors"
          >
            %
          </button>
          <button
            @click="performOperation('/')"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-operator text-calc-bg font-bold text-base sm:text-lg hover:bg-calc-operator-hover transition-colors"
          >
            ÷
          </button>

          <button
            @click="inputDigit('7')"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-surface text-calc-text font-bold text-base sm:text-lg hover:bg-calc-surface-hover transition-colors"
          >
            7
          </button>
          <button
            @click="inputDigit('8')"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-surface text-calc-text font-bold text-base sm:text-lg hover:bg-calc-surface-hover transition-colors"
          >
            8
          </button>
          <button
            @click="inputDigit('9')"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-surface text-calc-text font-bold text-base sm:text-lg hover:bg-calc-surface-hover transition-colors"
          >
            9
          </button>
          <button
            @click="performOperation('*')"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-operator text-calc-bg font-bold text-base sm:text-lg hover:bg-calc-operator-hover transition-colors"
          >
            ×
          </button>

          <button
            @click="inputDigit('4')"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-surface text-calc-text font-bold text-base sm:text-lg hover:bg-calc-surface-hover transition-colors"
          >
            4
          </button>
          <button
            @click="inputDigit('5')"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-surface text-calc-text font-bold text-base sm:text-lg hover:bg-calc-surface-hover transition-colors"
          >
            5
          </button>
          <button
            @click="inputDigit('6')"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-surface text-calc-text font-bold text-base sm:text-lg hover:bg-calc-surface-hover transition-colors"
          >
            6
          </button>
          <button
            @click="performOperation('-')"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-operator text-calc-bg font-bold text-base sm:text-lg hover:bg-calc-operator-hover transition-colors"
          >
            −
          </button>

          <button
            @click="inputDigit('1')"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-surface text-calc-text font-bold text-base sm:text-lg hover:bg-calc-surface-hover transition-colors"
          >
            1
          </button>
          <button
            @click="inputDigit('2')"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-surface text-calc-text font-bold text-base sm:text-lg hover:bg-calc-surface-hover transition-colors"
          >
            2
          </button>
          <button
            @click="inputDigit('3')"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-surface text-calc-text font-bold text-base sm:text-lg hover:bg-calc-surface-hover transition-colors"
          >
            3
          </button>
          <button
            @click="performOperation('+')"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-operator text-calc-bg font-bold text-base sm:text-lg hover:bg-calc-operator-hover transition-colors"
          >
            +
          </button>

          <button
            @click="inputDigit('0')"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-surface text-calc-text font-bold text-base sm:text-lg hover:bg-calc-surface-hover transition-colors"
          >
            0
          </button>
          <button
            @click="inputDot"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-surface text-calc-text font-bold text-base sm:text-lg hover:bg-calc-surface-hover transition-colors"
          >
            .
          </button>
          <button
            @click="equals"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-equal text-calc-bg font-bold text-base sm:text-lg hover:bg-calc-equal-hover transition-colors"
          >
            =
          </button>
          <button
            @click="goBack"
            :disabled="historyIndex < 0"
            class="calc-btn h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl bg-calc-accent text-calc-bg font-bold text-base sm:text-lg hover:bg-calc-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ←
          </button>
        </div>

        <footer v-if="memory !== 0" class="mt-3 sm:mt-4 text-center flex-none">
          <span class="inline-flex items-center gap-1.5 text-xs sm:text-sm text-calc-memory bg-calc-memory/10 px-3 py-1.5 rounded-full border border-calc-memory/20">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-calc-memory animate-pulse" />
            Память: {{ memory }}
          </span>
        </footer>
      </main>

      <aside v-if="history.length > 0" class="w-full lg:w-80 xl:w-96 flex-none bg-calc-bg rounded-2xl sm:rounded-3xl shadow-2xl border border-calc-border p-4 sm:p-6 flex flex-col min-h-0 overflow-hidden animate-scale-in">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4">
          <h3 class="text-sm sm:text-base font-semibold text-calc-text-muted">История вычислений</h3>
          <div class="flex gap-2">
            <button
              @click="goBack"
              :disabled="historyIndex <= 0"
              class="calc-btn flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-calc-surface text-calc-text text-xs sm:text-sm hover:bg-calc-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Назад
            </button>
            <button
              @click="goForward"
              :disabled="historyIndex >= history.length - 1"
              class="calc-btn flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-calc-surface text-calc-text text-xs sm:text-sm hover:bg-calc-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Вперед →
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto space-y-1.5 pr-1">
          <button
            v-for="(entry, index) in history"
            :key="index"
            @click="goToHistory(index)"
            :class="['history-item w-full text-left px-3 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-colors', index === historyIndex ? 'bg-calc-accent text-calc-bg font-medium shadow-lg shadow-calc-accent/20' : 'bg-calc-surface text-calc-text hover:bg-calc-surface-hover']"
          >
            {{ entry }}
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>
