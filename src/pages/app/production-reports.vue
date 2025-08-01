<script setup>
import { BarChart3, Calendar, Clock, TrendingUp, Users } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProductionReportStore } from '@/stores/productionReport'

useI18n()
const productionReportStore = useProductionReportStore()

// Reactive store data
const {
  hourlyOutputReports,
  hourlyProductionReports,
  outputStatistics,
  productionStatistics,
  productionByTeam,
} = storeToRefs(productionReportStore)

// Reactive state
const selectedTeam = ref('all')
const selectedShift = ref('all')

// Computed
const filteredOutputReports = computed(() => {
  let filtered = hourlyOutputReports.value

  if (selectedShift.value !== 'all') {
    filtered = filtered.filter(report => report.shift === selectedShift.value)
  }

  return filtered
})

const filteredProductionReports = computed(() => {
  let filtered = hourlyProductionReports.value

  if (selectedTeam.value !== 'all') {
    filtered = filtered.filter(production => production.team === selectedTeam.value)
  }

  return filtered
})

const availableTeams = computed(() => {
  return [...new Set(hourlyProductionReports.value.map(p => p.team))]
})

const hourlyBreakdown = computed(() => {
  const hours = [
    '06:00-07:00',
    '07:00-08:00',
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00',
    '18:00-19:00',
  ]

  return hours.map((hour) => {
    const totalOutput = hourlyProductionReports.value.reduce((sum, production) => {
      return sum + (production.hourlyData[hour]?.output || 0)
    }, 0)

    const totalAmount = hourlyProductionReports.value.reduce((sum, production) => {
      return sum + (production.hourlyData[hour]?.amount || 0)
    }, 0)

    return {
      hour,
      output: totalOutput,
      amount: totalAmount,
    }
  })
})

// Methods
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0)
}

function formatNumber(number) {
  return new Intl.NumberFormat('en-US').format(number || 0)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}

function getShiftVariant(shift) {
  return shift === 'day' ? 'default' : 'secondary'
}

function getEfficiencyVariant(efficiency) {
  if (efficiency >= 100)
    return 'success'
  if (efficiency >= 80)
    return 'default'
  return 'destructive'
}

function calculateEfficiency(output, target) {
  if (!target || target === 0)
    return 0
  return ((output / target) * 100).toFixed(1)
}

onMounted(async () => {
  await productionReportStore.fetchAllReports()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          Production Reports
        </h1>
        <p class="text-muted-foreground">
          Monitor hourly output and production performance
        </p>
      </div>
    </div>

    <!-- Statistics Overview -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Output
          </CardTitle>
          <BarChart3 class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ formatNumber(outputStatistics.totalOutput) }}
          </div>
          <p class="text-xs text-muted-foreground">
            Target: {{ formatNumber(outputStatistics.totalTarget) }}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Efficiency Rate
          </CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ outputStatistics.efficiencyRate }}%
          </div>
          <p class="text-xs text-muted-foreground">
            Overall performance
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Active Teams
          </CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ productionStatistics.totalTeams }}
          </div>
          <p class="text-xs text-muted-foreground">
            Production teams
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Revenue
          </CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ formatCurrency(outputStatistics.totalAmount) }}
          </div>
          <p class="text-xs text-muted-foreground">
            Production value
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Main Content Tabs -->
    <Tabs default-value="daily-output" class="space-y-4">
      <TabsList>
        <TabsTrigger value="daily-output">
          Daily Output
        </TabsTrigger>
        <TabsTrigger value="hourly-production">
          Hourly Production
        </TabsTrigger>
        <TabsTrigger value="team-performance">
          Team Performance
        </TabsTrigger>
        <TabsTrigger value="hourly-breakdown">
          Hourly Breakdown
        </TabsTrigger>
      </TabsList>

      <!-- Daily Output Tab -->
      <TabsContent value="daily-output" class="space-y-4">
        <!-- Filters -->
        <Card>
          <CardContent class="pt-6">
            <div class="flex gap-4">
              <Select v-model="selectedShift">
                <SelectTrigger class="w-[180px]">
                  <SelectValue placeholder="Filter by shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Shifts
                  </SelectItem>
                  <SelectItem value="day">
                    Day Shift
                  </SelectItem>
                  <SelectItem value="night">
                    Night Shift
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <!-- Daily Output Table -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Calendar class="h-5 w-5" />
              Daily Output Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b">
                    <th class="text-left p-2">
                      Date
                    </th>
                    <th class="text-left p-2">
                      Shift
                    </th>
                    <th class="text-left p-2">
                      Output
                    </th>
                    <th class="text-left p-2">
                      Target
                    </th>
                    <th class="text-left p-2">
                      Efficiency
                    </th>
                    <th class="text-left p-2">
                      Amount
                    </th>
                    <th class="text-left p-2">
                      Working Hours
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="report in filteredOutputReports" :key="report.id" class="border-b hover:bg-muted/50">
                    <td class="p-2">
                      {{ formatDate(report.date) }}
                    </td>
                    <td class="p-2">
                      <Badge :variant="getShiftVariant(report.shift)">
                        {{ report.shift }}
                      </Badge>
                    </td>
                    <td class="p-2 font-bold">
                      {{ formatNumber(report.dailyOutput) }}
                    </td>
                    <td class="p-2">
                      {{ formatNumber(report.target) }}
                    </td>
                    <td class="p-2">
                      <Badge :variant="getEfficiencyVariant(calculateEfficiency(report.dailyOutput, report.target))">
                        {{ calculateEfficiency(report.dailyOutput, report.target) }}%
                      </Badge>
                    </td>
                    <td class="p-2">
                      {{ formatCurrency(report.dailyAmount) }}
                    </td>
                    <td class="p-2">
                      {{ report.workingHour }}h
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <!-- Shift Comparison -->
        <div class="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Day Shift Performance</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2">
              <div class="flex justify-between">
                <span>Total Output:</span>
                <span class="font-bold">{{ formatNumber(outputStatistics.dayShift.totalOutput) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Average Output:</span>
                <span class="font-bold">{{ outputStatistics.dayShift.averageOutput }}</span>
              </div>
              <div class="flex justify-between">
                <span>Total Amount:</span>
                <span class="font-bold">{{ formatCurrency(outputStatistics.dayShift.totalAmount) }}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Night Shift Performance</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2">
              <div class="flex justify-between">
                <span>Total Output:</span>
                <span class="font-bold">{{ formatNumber(outputStatistics.nightShift.totalOutput) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Average Output:</span>
                <span class="font-bold">{{ outputStatistics.nightShift.averageOutput }}</span>
              </div>
              <div class="flex justify-between">
                <span>Total Amount:</span>
                <span class="font-bold">{{ formatCurrency(outputStatistics.nightShift.totalAmount) }}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- Hourly Production Tab -->
      <TabsContent value="hourly-production" class="space-y-4">
        <!-- Filters -->
        <Card>
          <CardContent class="pt-6">
            <div class="flex gap-4">
              <Select v-model="selectedTeam">
                <SelectTrigger class="w-[180px]">
                  <SelectValue placeholder="Filter by team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Teams
                  </SelectItem>
                  <SelectItem v-for="team in availableTeams" :key="team" :value="team">
                    {{ team }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <!-- Hourly Production Table -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Clock class="h-5 w-5" />
              Hourly Production Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b">
                    <th class="text-left p-2">
                      Team
                    </th>
                    <th class="text-left p-2">
                      People
                    </th>
                    <th class="text-left p-2">
                      Style
                    </th>
                    <th class="text-left p-2">
                      Color
                    </th>
                    <th class="text-left p-2">
                      Total Output
                    </th>
                    <th class="text-left p-2">
                      Total Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="production in filteredProductionReports" :key="production.id" class="border-b hover:bg-muted/50">
                    <td class="p-2 font-medium">
                      {{ production.team }}
                    </td>
                    <td class="p-2">
                      {{ production.people }}
                    </td>
                    <td class="p-2">
                      {{ production.style }}
                    </td>
                    <td class="p-2">
                      <Badge variant="outline">
                        {{ production.color }}
                      </Badge>
                    </td>
                    <td class="p-2 font-bold">
                      {{ formatNumber(production.total.output) }}
                    </td>
                    <td class="p-2">
                      {{ formatCurrency(production.total.amount) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Team Performance Tab -->
      <TabsContent value="team-performance" class="space-y-4">
        <div class="grid gap-4">
          <Card v-for="team in availableTeams" :key="team">
            <CardHeader>
              <CardTitle>{{ team }} Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div v-for="production in productionByTeam[team]" :key="production.id" class="space-y-3">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="font-medium">
                      {{ production.style }} - {{ production.color }}
                    </p>
                    <p class="text-sm text-muted-foreground">
                      {{ production.people }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold">
                      {{ formatNumber(production.total.output) }} pcs
                    </p>
                    <p class="text-sm">
                      {{ formatCurrency(production.total.amount) }}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- Hourly Breakdown Tab -->
      <TabsContent value="hourly-breakdown" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Clock class="h-5 w-5" />
              Hourly Production Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b">
                    <th class="text-left p-2">
                      Hour
                    </th>
                    <th class="text-left p-2">
                      Total Output
                    </th>
                    <th class="text-left p-2">
                      Total Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="hour in hourlyBreakdown" :key="hour.hour" class="border-b hover:bg-muted/50">
                    <td class="p-2 font-medium">
                      {{ hour.hour }}
                    </td>
                    <td class="p-2">
                      {{ formatNumber(hour.output) }}
                    </td>
                    <td class="p-2">
                      {{ formatCurrency(hour.amount) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
