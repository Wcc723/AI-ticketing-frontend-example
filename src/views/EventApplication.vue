<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const loading = ref(true)
const loadError = ref('')

const form = reactive({
  title: '',
  subtitle: '',
  location: {
    city: '',
    district: '',
    address: '',
    description: ''
  },
  schedule: {
    start: '',
    end: ''
  },
  description: '',
  capacityTotal: '',
  tags: [],
  status: '',
  currency: '',
  priceAmount: ''
})

const statusOptions = ['草稿', '審核中', '報名中', '已結束', '已取消']
const currencyOptions = ['TWD', 'USD', 'EUR', 'JPY']
const cityOptions = ref([])
const newTag = ref('')
const tagLimit = 5
const tagFeedback = ref('')
const remainingTags = computed(() => Math.max(tagLimit - form.tags.length, 0))
const editorModes = ['visual', 'html', 'preview']
const editorMode = ref(editorModes[0])
const htmlSource = ref('')
const visualEditorKey = ref(0)
const startDate = ref(null)
const endDate = ref(null)
const startTime = ref('')
const endTime = ref('')
const startHour = ref('')
const startMinute = ref('')
const endHour = ref('')
const endMinute = ref('')
const hourOptions = Array.from({ length: 24 }, (_, index) => pad(index))
const minuteOptions = Array.from({ length: 12 }, (_, index) => pad(index * 5))
let syncingSchedule = false

const datePickerUi = {
  menu: 'athlex-dp-menu',
  calendar: 'athlex-dp-calendar',
  calendarCell: 'athlex-dp-cell',
  navBtnPrev: 'athlex-dp-nav',
  navBtnNext: 'athlex-dp-nav',
}

function pad(value) {
  return `${value}`.padStart(2, '0')
}

function combineDateAndTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) return ''
  const [hours, minutes] = timeValue.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return ''
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''
  date.setHours(hours, minutes, 0, 0)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function parseLocalDateTime(value) {
  if (!value || typeof value !== 'string') {
    return { date: null, time: '' }
  }
  const [datePart, timePart] = value.split('T')
  if (!datePart || !timePart) {
    return { date: null, time: '' }
  }
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes] = timePart.split(':').map(Number)
  if ([year, month, day, hours, minutes].some((n) => Number.isNaN(n))) {
    return { date: null, time: '' }
  }
  const date = new Date(year, month - 1, day)
  date.setHours(0, 0, 0, 0)
  return { date, time: `${pad(hours)}:${pad(minutes)}` }
}

function toDateObject(dateValue, timeValue) {
  if (!dateValue || !timeValue) return null
  const [hours, minutes] = timeValue.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(hours, minutes, 0, 0)
  return date
}

function hasDescriptionContent(value) {
  if (!value) return false
  const stripped = value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  return stripped.length > 0
}

const fieldErrors = reactive({
  title: '',
  subtitle: '',
  locationCity: '',
  locationDistrict: '',
  address: '',
  start: '',
  end: '',
  description: '',
  capacityTotal: '',
  status: '',
  currency: '',
  priceAmount: ''
})

const baseInputClass = 'mt-2 w-full rounded-xl border px-4 py-3 text-gray-900 shadow-sm bg-white focus:outline-none transition'
const normalInputClass = 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-offset-0'
const errorInputClass = 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:ring-offset-0'

const formattedSchedule = computed(() => {
  if (!form.schedule.start || !form.schedule.end) return '尚未設定'
  const start = new Date(form.schedule.start)
  const end = new Date(form.schedule.end)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '尚未設定'
  const formatter = new Intl.DateTimeFormat('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
  return `${formatter.format(start)} → ${formatter.format(end)}`
})

const pricePreview = computed(() => {
  const price = Number(form.priceAmount)
  if (!form.currency || !Number.isFinite(price) || price <= 0) {
    return '尚未設定'
  }
  try {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: form.currency
    }).format(price)
  } catch (error) {
    console.warn('Unable to format currency:', error)
    return `${form.currency} ${price}`
  }
})

const districtOptions = computed(() => {
  const targetCity = cityOptions.value.find(city => city.name === form.location.city)
  return targetCity?.districts ?? []
})

watch(
  () => form.location.city,
  () => {
    form.location.district = ''
  }
)

watch(
  () => form.description,
  (value) => {
    if (fieldErrors.description && hasDescriptionContent(value)) {
      fieldErrors.description = ''
    }
  }
)

watch(editorMode, (mode) => {
  if (mode === 'html') {
    htmlSource.value = form.description || ''
  } else if (mode === 'visual') {
    visualEditorKey.value += 1
  } else if (mode === 'preview' && !hasDescriptionContent(form.description)) {
    htmlSource.value = ''
  }
})

watch(htmlSource, (value) => {
  if (editorMode.value === 'html') {
    form.description = value
  }
})

watch([startDate, startTime], ([dateValue, timeValue]) => {
  if (syncingSchedule) return
  form.schedule.start = combineDateAndTime(dateValue, timeValue)
  if (fieldErrors.start && dateValue && timeValue) {
    fieldErrors.start = ''
  }
}, { immediate: true })

watch([endDate, endTime], ([dateValue, timeValue]) => {
  if (syncingSchedule) return
  form.schedule.end = combineDateAndTime(dateValue, timeValue)
  if (fieldErrors.end && dateValue && timeValue) {
    fieldErrors.end = ''
  }
}, { immediate: true })

watch([startHour, startMinute], ([hour, minute]) => {
  if (syncingSchedule) return
  startTime.value = hour && minute ? `${hour}:${minute}` : ''
}, { immediate: true })

watch([endHour, endMinute], ([hour, minute]) => {
  if (syncingSchedule) return
  endTime.value = hour && minute ? `${hour}:${minute}` : ''
}, { immediate: true })

function addTag() {
  const value = newTag.value.trim()
  if (!value) {
    tagFeedback.value = ''
    return
  }

  if (form.tags.length >= tagLimit) {
    tagFeedback.value = `最多可新增 ${tagLimit} 個標籤`
    newTag.value = ''
    return
  }

  if (form.tags.includes(value)) {
    tagFeedback.value = '標籤已存在'
    newTag.value = ''
    return
  }

  form.tags.push(value)
  newTag.value = ''
  tagFeedback.value = ''
}

function removeTag(tag) {
  const index = form.tags.indexOf(tag)
  if (index !== -1) {
    form.tags.splice(index, 1)
    if (form.tags.length < tagLimit) {
      tagFeedback.value = ''
    }
  }
}

function handleTagKeydown(event) {
  if (event.key !== 'Enter' && tagFeedback.value && tagFeedback.value !== `最多可新增 ${tagLimit} 個標籤`) {
    tagFeedback.value = ''
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    addTag()
  } else if (event.key === 'Backspace' && !newTag.value && form.tags.length) {
    event.preventDefault()
    form.tags.pop()
    tagFeedback.value = ''
  }
}

function handleCapacityInput(event) {
  const digitsOnly = event.target.value.replace(/\D+/g, '')
  form.capacityTotal = digitsOnly
  if (fieldErrors.capacityTotal && digitsOnly) {
    fieldErrors.capacityTotal = ''
  }
}

function syncPickersFromSchedule() {
  syncingSchedule = true
  const { date: startDateValue, time: startTimeValue } = parseLocalDateTime(form.schedule.start)
  const { date: endDateValue, time: endTimeValue } = parseLocalDateTime(form.schedule.end)
  startDate.value = startDateValue
  startTime.value = startTimeValue
  startHour.value = startTimeValue ? startTimeValue.split(':')[0] : ''
  startMinute.value = startTimeValue ? startTimeValue.split(':')[1] : ''
  endDate.value = endDateValue
  endTime.value = endTimeValue
  endHour.value = endTimeValue ? endTimeValue.split(':')[0] : ''
  endMinute.value = endTimeValue ? endTimeValue.split(':')[1] : ''
  syncingSchedule = false
}

function handlePriceInput(event) {
  let value = event.target.value.replace(/[^0-9.]/g, '')
  const firstDot = value.indexOf('.')
  if (firstDot !== -1) {
    value = value.slice(0, firstDot + 1) + value.slice(firstDot + 1).replace(/\./g, '')
  }

  let [integerPart, decimalPart] = value.split('.')

  if (value.startsWith('.')) {
    integerPart = '0'
  }

  if (integerPart) {
    integerPart = integerPart.replace(/^0+(?=\d)/, '') || '0'
  }

  let formatted = integerPart || ''

  if (decimalPart !== undefined) {
    decimalPart = decimalPart.slice(0, 2)
    formatted = decimalPart.length ? `${formatted}.${decimalPart}` : `${formatted}.`
  }

  form.priceAmount = formatted
  event.target.value = formatted

  if (fieldErrors.priceAmount && formatted) {
    fieldErrors.priceAmount = ''
  }
}

function resetFieldErrors() {
  Object.keys(fieldErrors).forEach((key) => {
    fieldErrors[key] = ''
  })
}

function validateForm() {
  resetFieldErrors()
  let isValid = true

  if (!form.title.trim()) {
    fieldErrors.title = '請輸入活動標題'
    isValid = false
  }

  if (!form.subtitle.trim()) {
    fieldErrors.subtitle = '請輸入活動副標題'
    isValid = false
  }

  if (!form.location.city) {
    fieldErrors.locationCity = '請選擇縣市'
    isValid = false
  }

  if (!form.location.district) {
    fieldErrors.locationDistrict = '請選擇行政區'
    isValid = false
  }

  if (!form.location.address.trim()) {
    fieldErrors.address = '請輸入詳細地址'
    isValid = false
  }

  if (!startDate.value || !startTime.value) {
    fieldErrors.start = !startDate.value ? '請選擇開始日期' : '請選擇開始時間'
    isValid = false
  }

  if (!endDate.value || !endTime.value) {
    fieldErrors.end = !endDate.value ? '請選擇結束日期' : '請選擇結束時間'
    isValid = false
  }

  const startDateTime = toDateObject(startDate.value, startTime.value)
  const endDateTime = toDateObject(endDate.value, endTime.value)

  if (startDate.value && startTime.value && !startDateTime) {
    fieldErrors.start = '請輸入有效的開始時間'
    isValid = false
  }

  if (endDate.value && endTime.value && !endDateTime) {
    fieldErrors.end = '請輸入有效的結束時間'
    isValid = false
  }

  if (startDateTime && endDateTime && endDateTime <= startDateTime) {
    fieldErrors.end = '結束時間需晚於開始時間'
    isValid = false
  }

  if (!hasDescriptionContent(form.description)) {
    fieldErrors.description = '請輸入活動介紹'
    isValid = false
  }

  const capacity = Number(form.capacityTotal)
  if (form.capacityTotal === '') {
    fieldErrors.capacityTotal = '請輸入總名額'
    isValid = false
  } else if (!Number.isFinite(capacity) || capacity <= 0 || !Number.isInteger(capacity)) {
    fieldErrors.capacityTotal = '請輸入大於 0 的整數'
    isValid = false
  }

  if (!form.status) {
    fieldErrors.status = '請選擇狀態'
    isValid = false
  }

  if (!form.currency) {
    fieldErrors.currency = '請選擇幣別'
    isValid = false
  }

  const price = Number(form.priceAmount)
  if (form.priceAmount === '') {
    fieldErrors.priceAmount = '請輸入票價'
    isValid = false
  } else if (!Number.isFinite(price) || price <= 0) {
    fieldErrors.priceAmount = '票價需為大於 0 的數值'
    isValid = false
  }

  return isValid
}

function handleSubmit() {
  if (!validateForm()) return

  const payload = {
    title: form.title.trim(),
    subtitle: form.subtitle.trim(),
    location: {
      city: form.location.city,
      district: form.location.district,
      address: form.location.address.trim(),
      description: form.location.description.trim()
    },
    schedule: {
      start: form.schedule.start,
      end: form.schedule.end
    },
    description: form.description,
    capacity: {
      total: Number(form.capacityTotal)
    },
    tags: [...form.tags],
    status: form.status,
    pricing: {
      currency: form.currency,
      amount: Number(form.priceAmount)
    }
  }

  console.log('Event application payload', payload)
  alert('已建立活動草稿，請至後台提交審核。')
}

async function loadCityData() {
  try {
    const response = await fetch('/data/taiwan-city-districts.json')
    if (!response.ok) throw new Error('Network response was not ok')
    const data = await response.json()
    cityOptions.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error(error)
    loadError.value = '載入地區資料失敗，請稍後再試。'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  syncPickersFromSchedule()
  loadCityData()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
    <header class="bg-white/80 backdrop-blur border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-3">
            <router-link to="/menu" class="flex items-center space-x-2">
              <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span class="text-white font-bold text-base">A</span>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-indigo-500">AthleX Backend</p>
                <p class="text-lg font-semibold text-gray-900">活動申請中心</p>
              </div>
            </router-link>
          </div>
          <div class="flex items-center space-x-2">
            <router-link to="/event" class="px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 transition">查看前台頁面</router-link>
            <span class="w-px h-6 bg-gray-200" />
            <button class="p-2 rounded-full hover:bg-gray-100 transition" aria-label="notifications">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button class="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-gray-900">建立新的活動申請</h1>
          <p class="mt-2 text-sm text-gray-600">請填寫以下資訊，我們會依據資料進行審核。所有欄位皆為空白，請依需求輸入內容。</p>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8">
            <div v-if="loadError" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
              {{ loadError }}
            </div>

            <form @submit.prevent="handleSubmit">
              <section class="bg-white/90 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-8 space-y-10">
                <div class="space-y-12">
                  <div class="space-y-6">
                    <div>
                      <h2 class="text-lg font-semibold text-gray-900">基本資訊</h2>
                      <p class="text-sm text-gray-500 mt-1">這些資訊將顯示在活動頁面上。</p>
                    </div>
                    <div class="grid grid-cols-1 gap-6">
                      <div>
                        <label for="title" class="block text-sm font-medium text-gray-700">活動標題 <span class="text-red-500">*</span></label>
                        <input
                          id="title"
                          v-model="form.title"
                          type="text"
                          :class="[baseInputClass, fieldErrors.title ? errorInputClass : normalInputClass]"
                          placeholder="請輸入活動名稱"
                        >
                        <p v-if="fieldErrors.title" class="mt-1 text-sm text-red-500">{{ fieldErrors.title }}</p>
                      </div>

                      <div>
                        <label for="subtitle" class="block text-sm font-medium text-gray-700">副標題 <span class="text-red-500">*</span></label>
                        <input
                          id="subtitle"
                          v-model="form.subtitle"
                          type="text"
                          :class="[baseInputClass, fieldErrors.subtitle ? errorInputClass : normalInputClass]"
                          placeholder="補充活動亮點"
                        >
                        <p v-if="fieldErrors.subtitle" class="mt-1 text-sm text-red-500">{{ fieldErrors.subtitle }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-6">
                    <div>
                      <h2 class="text-lg font-semibold text-gray-900">活動地點</h2>
                      <p class="text-sm text-gray-500 mt-1">請依序選擇縣市、行政區，並填寫詳細地址。</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label for="city" class="block text-sm font-medium text-gray-700">縣市 <span class="text-red-500">*</span></label>
                        <select
                          id="city"
                          v-model="form.location.city"
                          :class="[baseInputClass, fieldErrors.locationCity ? errorInputClass : normalInputClass]"
                        >
                          <option value="" disabled>請選擇</option>
                          <option v-for="city in cityOptions" :key="city.name" :value="city.name">{{ city.name }}</option>
                        </select>
                        <p v-if="fieldErrors.locationCity" class="mt-1 text-sm text-red-500">{{ fieldErrors.locationCity }}</p>
                      </div>

                      <div>
                        <label for="district" class="block text-sm font-medium text-gray-700">行政區 <span class="text-red-500">*</span></label>
                        <select
                          id="district"
                          v-model="form.location.district"
                          :disabled="!form.location.city"
                          :class="[baseInputClass, fieldErrors.locationDistrict ? errorInputClass : normalInputClass, !form.location.city ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : '']"
                        >
                          <option value="" disabled>{{ form.location.city ? '請選擇行政區' : '請先選擇縣市' }}</option>
                          <option v-for="district in districtOptions" :key="district" :value="district">{{ district }}</option>
                        </select>
                        <p v-if="fieldErrors.locationDistrict" class="mt-1 text-sm text-red-500">{{ fieldErrors.locationDistrict }}</p>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 gap-6">
                      <div>
                        <label for="address" class="block text-sm font-medium text-gray-700">詳細地址 <span class="text-red-500">*</span></label>
                        <input
                          id="address"
                          v-model="form.location.address"
                          type="text"
                          :class="[baseInputClass, fieldErrors.address ? errorInputClass : normalInputClass]"
                          placeholder="例：信義路五段 7 號 101 樓"
                        >
                        <p v-if="fieldErrors.address" class="mt-1 text-sm text-red-500">{{ fieldErrors.address }}</p>
                      </div>

                      <div>
                        <label for="location-description" class="block text-sm font-medium text-gray-700">場地描述（選填）</label>
                        <textarea
                          id="location-description"
                          v-model="form.location.description"
                          rows="3"
                          :class="[baseInputClass, normalInputClass, 'min-h-[120px]']"
                          placeholder="描述場地特色與設備"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-6">
                    <div>
                      <h2 class="text-lg font-semibold text-gray-900">活動時間</h2>
                      <p class="text-sm text-gray-500 mt-1">分別選擇日期與時間，系統會自動組合完整時段。</p>
                    </div>
                    <div class="space-y-6">
                      <div class="space-y-4 bg-white/60 border border-gray-200 rounded-xl p-4 shadow-sm">
                        <p class="text-sm font-semibold text-gray-700">開始 <span class="text-red-500">*</span></p>
                        <div class="space-y-3">
                          <div>
                            <label for="start-date" class="block text-xs font-medium uppercase tracking-wide text-gray-500">日期 <span class="text-red-500">*</span></label>
                            <VueDatePicker
                              id="start-date"
                              v-model="startDate"
                              :enable-time-picker="false"
                              :format="'yyyy-MM-dd'"
                              :preview-format="'yyyy 年 MM 月 dd 日'"
                              locale="zh-TW"
                              auto-apply
                              :teleport="false"
                              :ui="datePickerUi"
                              placeholder="選擇日期"
                              :input-class="fieldErrors.start ? 'dp-input dp-input-error' : 'dp-input'"
                              :class="fieldErrors.start ? 'ring-2 ring-red-200 rounded-xl' : ''"
                            />
                          </div>
                          <div>
                            <label class="block text-xs font-medium uppercase tracking-wide text-gray-500">時間 <span class="text-red-500">*</span></label>
                            <div class="grid grid-cols-2 gap-3">
                              <div>
                                <select
                                  v-model="startHour"
                                  :class="[baseInputClass, 'mt-0', fieldErrors.start ? errorInputClass : normalInputClass]"
                                >
                                  <option value="">小時</option>
                                  <option v-for="hour in hourOptions" :key="`start-hour-${hour}`" :value="hour">
                                    {{ hour }}
                                  </option>
                                </select>
                              </div>
                              <div>
                                <select
                                  v-model="startMinute"
                                  :class="[baseInputClass, 'mt-0', fieldErrors.start ? errorInputClass : normalInputClass]"
                                >
                                  <option value="">分鐘</option>
                                  <option v-for="minute in minuteOptions" :key="`start-minute-${minute}`" :value="minute">
                                    {{ minute }}
                                  </option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p v-if="fieldErrors.start" class="text-sm text-red-500">{{ fieldErrors.start }}</p>
                      </div>

                      <div class="space-y-4 bg-white/60 border border-gray-200 rounded-xl p-4 shadow-sm">
                        <p class="text-sm font-semibold text-gray-700">結束 <span class="text-red-500">*</span></p>
                        <div class="space-y-3">
                          <div>
                            <label for="end-date" class="block text-xs font-medium uppercase tracking-wide text-gray-500">日期 <span class="text-red-500">*</span></label>
                            <VueDatePicker
                              id="end-date"
                              v-model="endDate"
                              :enable-time-picker="false"
                              :format="'yyyy-MM-dd'"
                              :preview-format="'yyyy 年 MM 月 dd 日'"
                              locale="zh-TW"
                              auto-apply
                              :teleport="false"
                              :ui="datePickerUi"
                              placeholder="選擇日期"
                              :input-class="fieldErrors.end ? 'dp-input dp-input-error' : 'dp-input'"
                              :class="fieldErrors.end ? 'ring-2 ring-red-200 rounded-xl' : ''"
                            />
                          </div>
                          <div>
                            <label class="block text-xs font-medium uppercase tracking-wide text-gray-500">時間 <span class="text-red-500">*</span></label>
                            <div class="grid grid-cols-2 gap-3">
                              <div>
                                <select
                                  v-model="endHour"
                                  :class="[baseInputClass, 'mt-0', fieldErrors.end ? errorInputClass : normalInputClass]"
                                >
                                  <option value="">小時</option>
                                  <option v-for="hour in hourOptions" :key="`end-hour-${hour}`" :value="hour">
                                    {{ hour }}
                                  </option>
                                </select>
                              </div>
                              <div>
                                <select
                                  v-model="endMinute"
                                  :class="[baseInputClass, 'mt-0', fieldErrors.end ? errorInputClass : normalInputClass]"
                                >
                                  <option value="">分鐘</option>
                                  <option v-for="minute in minuteOptions" :key="`end-minute-${minute}`" :value="minute">
                                    {{ minute }}
                                  </option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p v-if="fieldErrors.end" class="text-sm text-red-500">{{ fieldErrors.end }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-6">
                    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 class="text-lg font-semibold text-gray-900">活動介紹 <span class="text-red-500">*</span></h2>
                        <p class="text-sm text-gray-500 mt-1">分享活動內容、亮點與參與者可期待的體驗。</p>
                      </div>
                      <div class="inline-flex rounded-full border border-gray-200 bg-white p-1 text-xs font-medium shadow-sm">
                        <button
                          v-for="mode in editorModes"
                          :key="mode"
                          type="button"
                          class="px-3 py-1.5 rounded-full transition capitalize"
                          :class="editorMode === mode ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:text-indigo-600'"
                          @click="editorMode = mode"
                        >
                          {{ mode === 'visual' ? '所見即所得' : mode === 'html' ? 'HTML' : '預覽' }}
                        </button>
                      </div>
                    </div>
                      <div class="space-y-3">
                        <div v-if="editorMode === 'visual'" class="rich-editor rounded-xl border border-gray-200 overflow-hidden bg-white" :key="`visual-${visualEditorKey}`">
                        <QuillEditor
                          v-model:content="form.description"
                          content-type="html"
                          theme="snow"
                          :toolbar="[
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ header: 1 }, { header: 2 }],
                            [{ list: 'ordered' }, { list: 'bullet' }],
                            ['link', 'blockquote', 'code-block'],
                            [{ color: [] }, { background: [] }],
                            ['clean']
                          ]"
                        />
                      </div>
                      <div v-else class="space-y-2">
                        <textarea
                          v-if="editorMode === 'html'"
                          v-model="htmlSource"
                          rows="14"
                          spellcheck="false"
                          class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          placeholder="直接輸入或編修 HTML 內容"
                        ></textarea>
                        <div
                          v-else
                          class="preview-pane rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-inner text-sm leading-relaxed text-gray-800"
                          v-html="form.description || '<p class=\'text-gray-400\'>目前沒有內容</p>'"
                        ></div>
                        <p class="text-xs text-gray-500">可使用切換檢視內容，HTML 模式資料會與其他模式保持同步。</p>
                      </div>
                      <p v-if="fieldErrors.description" class="text-sm text-red-500">{{ fieldErrors.description }}</p>
                    </div>
                  </div>

                  <div class="space-y-6">
                    <div>
                      <h2 class="text-lg font-semibold text-gray-900">名額與分類</h2>
                      <p class="text-sm text-gray-500 mt-1">設定報名名額、活動狀態與標籤。</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label for="capacity" class="block text-sm font-medium text-gray-700">總名額 <span class="text-red-500">*</span></label>
                        <input
                          id="capacity"
                          v-model="form.capacityTotal"
                          type="text"
                          inputmode="numeric"
                          pattern="\\d*"
                          :class="[baseInputClass, fieldErrors.capacityTotal ? errorInputClass : normalInputClass]"
                          placeholder="例：30"
                          @input="handleCapacityInput"
                        >
                        <p v-if="fieldErrors.capacityTotal" class="mt-1 text-sm text-red-500">{{ fieldErrors.capacityTotal }}</p>
                      </div>

                      <div>
                        <label for="status" class="block text-sm font-medium text-gray-700">活動狀態 <span class="text-red-500">*</span></label>
                        <select
                          id="status"
                          v-model="form.status"
                          :class="[baseInputClass, fieldErrors.status ? errorInputClass : normalInputClass]"
                        >
                          <option value="" disabled>請選擇狀態</option>
                          <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
                        </select>
                        <p v-if="fieldErrors.status" class="mt-1 text-sm text-red-500">{{ fieldErrors.status }}</p>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">標籤（選填）</label>
                      <div class="mt-2">
                        <div
                          class="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition"
                        >
                          <span
                            v-for="tag in form.tags"
                            :key="tag"
                            class="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm"
                          >
                            {{ tag }}
                            <button type="button" class="ml-2 text-indigo-500 hover:text-indigo-700" @click="removeTag(tag)">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                          <input
                            v-model="newTag"
                            type="text"
                            :placeholder="form.tags.length ? (form.tags.length >= tagLimit ? '標籤已達上限' : '再輸入以新增標籤') : '輸入標籤後按 Enter'"
                            :readonly="form.tags.length >= tagLimit"
                            :class="[ 'flex-1 min-w-[100px] border-none bg-transparent text-sm text-gray-900 placeholder-gray-400 py-1 focus:outline-none', form.tags.length >= tagLimit ? 'cursor-not-allowed text-gray-400' : '' ]"
                            @keydown="handleTagKeydown"
                          >
                        </div>
                        <div class="mt-2 flex justify-between text-xs text-gray-500">
                          <span :class="tagFeedback ? 'text-red-500' : 'text-gray-500'">
                            {{ tagFeedback || `可再新增 ${remainingTags} 個標籤` }}
                          </span>
                          <span>已新增 {{ form.tags.length }} / {{ tagLimit }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-6">
                    <div>
                      <h2 class="text-lg font-semibold text-gray-900">票價設定</h2>
                      <p class="text-sm text-gray-500 mt-1">設定報名費用的幣別與金額。</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label for="currency" class="block text-sm font-medium text-gray-700">幣別 <span class="text-red-500">*</span></label>
                        <select
                          id="currency"
                          v-model="form.currency"
                          :class="[baseInputClass, fieldErrors.currency ? errorInputClass : normalInputClass]"
                        >
                          <option value="" disabled>請選擇幣別</option>
                          <option v-for="currency in currencyOptions" :key="currency" :value="currency">{{ currency }}</option>
                        </select>
                        <p v-if="fieldErrors.currency" class="mt-1 text-sm text-red-500">{{ fieldErrors.currency }}</p>
                      </div>

                      <div>
                        <label for="price" class="block text-sm font-medium text-gray-700">票價 <span class="text-red-500">*</span></label>
                        <div class="relative">
                          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-sm text-gray-400">
                            {{ form.currency || '幣別' }}
                          </div>
                          <input
                            id="price"
                            :value="form.priceAmount"
                            type="text"
                            inputmode="decimal"
                            :class="[baseInputClass, fieldErrors.priceAmount ? errorInputClass : normalInputClass, 'pl-20']"
                            placeholder="請輸入票價"
                            @input="handlePriceInput"
                          >
                        </div>
                        <p v-if="fieldErrors.priceAmount" class="mt-1 text-sm text-red-500">{{ fieldErrors.priceAmount }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex justify-end pt-4">
                <button type="submit" class="inline-flex items-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition cursor-pointer">
                  送出申請草稿
                </button>
                </div>
              </section>
            </form>
          </div>

          <aside class="space-y-6">
            <section class="bg-white/90 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 class="text-base font-semibold text-gray-900 mb-4">審核資訊摘要</h3>
              <dl class="space-y-4 text-sm text-gray-700">
                <div class="flex justify-between">
                  <dt class="text-gray-500">標題</dt>
                  <dd class="font-medium text-right text-gray-900 max-w-[60%] truncate">{{ form.title || '尚未填寫' }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">縣市 / 行政區</dt>
                  <dd class="text-right text-gray-900 max-w-[60%] truncate">
                    {{ form.location.city ? `${form.location.city} ${form.location.district || ''}` : '待更新' }}
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">地址</dt>
                  <dd class="text-right text-gray-900 max-w-[60%] truncate">{{ form.location.address || '待更新' }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">時段</dt>
                  <dd class="text-right text-gray-900 max-w-[60%]">{{ formattedSchedule }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">名額</dt>
                  <dd class="text-right text-gray-900">{{ form.capacityTotal || '0' }} 人</dd>
                </div>
                <div>
                  <dt class="text-gray-500">標籤</dt>
                  <dd class="mt-2 flex flex-wrap gap-2">
                    <span v-for="tag in form.tags" :key="tag" class="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium">{{ tag }}</span>
                    <span v-if="!form.tags.length" class="text-gray-400">尚未設定</span>
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">票價</dt>
                  <dd class="text-right text-gray-900">{{ pricePreview }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">狀態</dt>
                  <dd class="text-right text-indigo-600 font-medium">{{ form.status || '未選擇' }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">幣別</dt>
                  <dd class="text-right text-gray-900">{{ form.currency || '未選擇' }}</dd>
                </div>
              </dl>
            </section>

            <section class="bg-indigo-500/10 border border-indigo-200 rounded-2xl p-6 space-y-4">
              <div class="flex items-start space-x-3">
                <span class="text-2xl">💡</span>
                <div>
                  <h3 class="text-sm font-semibold text-indigo-600">申請小提醒</h3>
                  <ul class="mt-2 text-sm text-indigo-900 space-y-2">
                    <li>提供完整的場地安全資訊將加速審核通過。</li>
                    <li>活動時間建議至少於活動前 14 天提交。</li>
                    <li>標籤越明確，曝光與推薦效果越佳。</li>
                  </ul>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
:deep(.rich-editor .ql-editor) {
  min-height: 320px;
  padding: 1.25rem;
}

:deep(.rich-editor .ql-container) {
  border: none;
}

:deep(.rich-editor .ql-toolbar) {
  border: none;
  border-bottom: 1px solid rgba(229, 231, 235, 0.9);
  padding: 0.75rem 1rem;
}

:deep(.rich-editor .ql-editor.ql-blank::before) {
  color: #9ca3af;
}

:deep(.dp-input) {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  color: #1f2937;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

:deep(.dp-input:focus),
:deep(.dp-input.dp-input-focus) {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}

:deep(.dp-input-error) {
  border-color: #fca5a5 !important;
  box-shadow: 0 0 0 4px rgba(248, 113, 113, 0.15);
}

:deep(.athlex-dp-menu) {
  border-radius: 1rem;
  border: 1px solid rgba(99, 102, 241, 0.08);
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
  padding: 1rem 1rem 1.25rem;
}

:deep(.athlex-dp-menu .dp__menu_header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid rgba(99, 102, 241, 0.08);
}

:deep(.athlex-dp-nav.dp__btn) {
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 0.85rem;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(129, 140, 248, 0.18) 100%);
  color: #4338ca;
  box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.18);
  transition: all 0.18s ease;
}

:deep(.athlex-dp-nav.dp__btn:hover) {
  transform: translateY(-1px);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.22) 0%, rgba(129, 140, 248, 0.32) 100%);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.22);
  color: #312e81;
}

:deep(.athlex-dp-nav.dp__btn .dp__btn_inner) {
  background: transparent;
  border: none;
  box-shadow: none;
}

:deep(.athlex-dp-nav .dp__inner_nav) {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: transparent;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: inherit;
}

:deep(.athlex-dp-nav .dp__inner_nav:hover) {
  background: transparent;
}

:deep(.athlex-dp-nav.dp__btn svg) {
  width: 1.05rem;
  height: 1.05rem;
}

:deep(.athlex-dp-menu .dp__month_year_select) {
  font-weight: 600;
  color: #1e1b4b;
  font-size: 0.95rem;
}

:deep(.athlex-dp-menu .dp__calendar_header) {
  color: #6366f1;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

:deep(.athlex-dp-calendar .dp__calendar_row) {
  gap: 0.35rem;
}

:deep(.athlex-dp-cell .dp__cell_inner) {
  border-radius: 0.9rem;
  padding: 0.65rem 0.5rem;
  font-weight: 500;
  color: #1f2937;
  transition: all 0.18s ease;
}

:deep(.athlex-dp-cell .dp__cell_inner:hover) {
  background: rgba(99, 102, 241, 0.12);
  color: #312e81;
}

:deep(.athlex-dp-cell .dp__cell_inner.dp__today) {
  box-shadow: inset 0 0 0 2px rgba(99, 102, 241, 0.3);
  color: #4338ca;
}

:deep(.athlex-dp-cell .dp__cell_inner.dp__active_date) {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff !important;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.25);
}

:deep(.athlex-dp-cell .dp__cell_inner.dp__cell_disabled) {
  color: #cbd5f5 !important;
  text-decoration: line-through;
  pointer-events: none;
}

:deep(.athlex-dp-menu .dp__time_picker) {
  background: rgba(248, 250, 252, 0.9);
  border-radius: 0.95rem;
  padding: 0.9rem 0.85rem;
  gap: 0.9rem;
}

:deep(.athlex-dp-menu .dp__time_col) {
  background: #ffffff;
  border-radius: 0.85rem;
  padding: 0.55rem 0.35rem;
  border: none;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
}

:deep(.athlex-dp-menu .dp__time_col .dp__time_display) {
  font-weight: 600;
  color: #1e1b4b;
  margin-bottom: 0.45rem;
}

:deep(.athlex-dp-menu .dp__time_col .dp__time_list) {
  max-height: 165px;
  padding: 0.25rem 0.3rem;
}

:deep(.athlex-dp-menu .dp__time_col .dp__time_item) {
  border-radius: 0.75rem;
  padding: 0.45rem 0.6rem;
  font-weight: 500;
  color: #1f2937;
  transition: all 0.16s ease;
}

:deep(.athlex-dp-menu .dp__time_col .dp__time_item:hover) {
  background: rgba(99, 102, 241, 0.12);
  color: #312e81;
}

:deep(.athlex-dp-menu .dp__time_col .dp__time_item.dp__active_time) {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(129, 140, 248, 0.32) 100%);
  color: #312e81;
  box-shadow: 0 10px 24px rgba(79, 70, 229, 0.18);
}
</style>
