<script setup>
import {
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  Package,
  Printer,
  Settings,
  Truck,
} from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

useI18n()

// Process flow steps based on the diagram
const processSteps = [
  {
    id: 1,
    title: 'Input Order',
    subtitle: 'Masuk Photo Graphic',
    icon: FileText,
    description: 'Order input with graphic design requirements',
    status: 'completed',
    color: 'bg-blue-500',
  },
  {
    id: 2,
    title: 'Input Farm-in',
    subtitle: 'per Style',
    icon: Package,
    description: 'Farm-in process per style specification',
    status: 'completed',
    color: 'bg-blue-500',
  },
  {
    id: 3,
    title: 'Production Input',
    subtitle: 'per jam/per line',
    icon: Settings,
    description: 'Production scheduling per hour per line',
    status: 'in-progress',
    color: 'bg-blue-500',
  },
  {
    id: 4,
    title: 'QC',
    subtitle: 'Input Qty dicek QC dan Qty Reject',
    icon: CheckCircle,
    description: 'Quality control inspection and reject quantity tracking',
    status: 'pending',
    color: 'bg-blue-500',
  },
  {
    id: 5,
    title: 'Input Farm-out',
    subtitle: 'per style dan per size',
    icon: Truck,
    description: 'Farm-out process per style and size',
    status: 'pending',
    color: 'bg-blue-500',
  },
  {
    id: 6,
    title: 'Print Detail',
    subtitle: 'Packing List',
    icon: Printer,
    description: 'Generate and print detailed packing list',
    status: 'pending',
    color: 'bg-blue-500',
  },
  {
    id: 7,
    title: 'Print Surat Jalan',
    subtitle: '',
    icon: FileText,
    description: 'Generate delivery note for shipment',
    status: 'pending',
    color: 'bg-blue-500',
  },
]

// Additional process details
const processDetails = {
  orderInput: {
    title: 'Order Input Process',
    steps: [
      'Receive order from buyer',
      'Upload graphic design files',
      'Verify order specifications',
      'Set delivery timeline',
    ],
  },
  farmIn: {
    title: 'Farm-in Process',
    steps: [
      'Material planning per style',
      'Fabric cutting preparation',
      'Component allocation',
      'Style-specific requirements',
    ],
  },
  production: {
    title: 'Production Process',
    steps: [
      'Hourly production tracking',
      'Line efficiency monitoring',
      'Quality checkpoints',
      'Progress reporting',
    ],
  },
  qualityControl: {
    title: 'Quality Control',
    steps: [
      'Inspection of finished products',
      'Defect identification and categorization',
      'Reject quantity tracking',
      'Quality approval process',
    ],
  },
  farmOut: {
    title: 'Farm-out Process',
    steps: [
      'Size segregation',
      'Style completion verification',
      'Packing preparation',
      'Final count verification',
    ],
  },
  printing: {
    title: 'Documentation & Printing',
    steps: [
      'Generate packing list',
      'Print delivery documentation',
      'Create shipping labels',
      'Prepare export documents',
    ],
  },
}

function getStatusVariant(status) {
  const variants = {
    'completed': 'success',
    'in-progress': 'default',
    'pending': 'secondary',
  }
  return variants[status] || 'secondary'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          ERP Process Flow
        </h1>
        <p class="text-muted-foreground">
          Complete workflow from order input to delivery
        </p>
      </div>
    </div>

    <!-- Process Flow Diagram -->
    <Card>
      <CardHeader>
        <CardTitle>Production Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap justify-center items-center gap-4 p-4">
          <template v-for="(step, index) in processSteps" :key="step.id">
            <!-- Process Step -->
            <div class="flex flex-col items-center space-y-2 min-w-[160px]">
              <div
                class="w-16 h-16 rounded-lg flex items-center justify-center text-white"
                :class="step.color"
              >
                <component :is="step.icon" class="w-8 h-8" />
              </div>
              <div class="text-center">
                <h3 class="font-semibold text-sm">
                  {{ step.title }}
                </h3>
                <p class="text-xs text-muted-foreground">
                  {{ step.subtitle }}
                </p>
                <Badge :variant="getStatusVariant(step.status)" class="mt-1">
                  {{ step.status }}
                </Badge>
              </div>
            </div>

            <!-- Arrow between steps -->
            <div v-if="index < processSteps.length - 1" class="flex items-center">
              <ArrowRight class="w-6 h-6 text-muted-foreground" />
            </div>
          </template>
        </div>
      </CardContent>
    </Card>

    <!-- Process Details Grid -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <FileText class="w-5 h-5" />
            {{ processDetails.orderInput.title }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2">
            <li
              v-for="step in processDetails.orderInput.steps"
              :key="step"
              class="flex items-center gap-2"
            >
              <CheckCircle class="w-4 h-4 text-green-500" />
              <span class="text-sm">{{ step }}</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Package class="w-5 h-5" />
            {{ processDetails.farmIn.title }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2">
            <li
              v-for="step in processDetails.farmIn.steps"
              :key="step"
              class="flex items-center gap-2"
            >
              <CheckCircle class="w-4 h-4 text-green-500" />
              <span class="text-sm">{{ step }}</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Settings class="w-5 h-5" />
            {{ processDetails.production.title }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2">
            <li
              v-for="step in processDetails.production.steps"
              :key="step"
              class="flex items-center gap-2"
            >
              <Clock class="w-4 h-4 text-blue-500" />
              <span class="text-sm">{{ step }}</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <CheckCircle class="w-5 h-5" />
            {{ processDetails.qualityControl.title }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2">
            <li
              v-for="step in processDetails.qualityControl.steps"
              :key="step"
              class="flex items-center gap-2"
            >
              <Clock class="w-4 h-4 text-gray-500" />
              <span class="text-sm">{{ step }}</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Truck class="w-5 h-5" />
            {{ processDetails.farmOut.title }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2">
            <li
              v-for="step in processDetails.farmOut.steps"
              :key="step"
              class="flex items-center gap-2"
            >
              <Clock class="w-4 h-4 text-gray-500" />
              <span class="text-sm">{{ step }}</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Printer class="w-5 h-5" />
            {{ processDetails.printing.title }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2">
            <li
              v-for="step in processDetails.printing.steps"
              :key="step"
              class="flex items-center gap-2"
            >
              <Clock class="w-4 h-4 text-gray-500" />
              <span class="text-sm">{{ step }}</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>

    <!-- Process Status Legend -->
    <Card>
      <CardHeader>
        <CardTitle>Status Legend</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center gap-2">
            <Badge variant="success">
              Completed
            </Badge>
            <span class="text-sm">Process completed successfully</span>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="default">
              In Progress
            </Badge>
            <span class="text-sm">Currently being processed</span>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="secondary">
              Pending
            </Badge>
            <span class="text-sm">Waiting to be started</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Key Performance Indicators -->
    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Process Efficiency
          </CardTitle>
          <Settings class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            94.5%
          </div>
          <p class="text-xs text-muted-foreground">
            +2.1% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Average Lead Time
          </CardTitle>
          <Clock class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            12.3 days
          </div>
          <p class="text-xs text-muted-foreground">
            -0.5 days from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Quality Pass Rate
          </CardTitle>
          <CheckCircle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            98.7%
          </div>
          <p class="text-xs text-muted-foreground">
            +0.3% from last month
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
