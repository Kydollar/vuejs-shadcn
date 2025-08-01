# ERP System Frontend

This is a comprehensive ERP (Enterprise Resource Planning) frontend application built with Vue 3, featuring modern UI/UX design and bilingual support (English/Indonesian).

## Tech Stack

- **Vue 3** - Composition API with setup script syntax
- **Vite** - Lightning fast build tool
- **Pinia** - State management
- **@tanstack/vue-query** - Server state management
- **shadcn-vue** - Modern UI component library
- **Vue Router** - Auto-generated routes
- **vue-i18n** - Internationalization
- **VeeValidate** - Form validation (planned)
- **Tailwind CSS** - Utility-first CSS framework

## ERP Workflow

The system follows a complete manufacturing workflow:

```
Orders → Production → QC → FarmOut → PackingList → DeliveryNote
```

## Features Implemented

### ✅ Core Infrastructure
- Bilingual support (EN/ID) with comprehensive ERP terminology
- Auto-generated routing system
- Modern sidebar navigation with ERP menu
- Responsive design with dark/light mode

### ✅ ERP Modules

#### Dashboard
- Real-time metrics and KPIs
- Order statistics and production overview
- Alert management system
- Charts and data visualization

#### Order Management
- Complete CRUD operations
- File upload for specifications
- Status tracking (Draft, Confirmed, In Production, etc.)
- Integration with buyers and products

#### Production Tracking
- Hourly production entries
- Efficiency metrics calculation
- Machine assignment and tracking
- Real-time progress monitoring

#### Quality Control (QC)
- Inspection management
- Pass/fail tracking with rejection reasons
- Quality metrics and reporting
- Batch inspection workflows

#### Master Data
- **Buyers**: Customer information management
- **Factories**: Manufacturing facility data
- **Products**: Product catalog with specifications

### 🔄 Placeholder Modules
- **Decorations**: Design and customization management
- **Farm Out**: Subcontractor result tracking
- **Packing List**: Shipment preparation
- **Delivery Note**: Final shipment documentation

## State Management

### Pinia Stores
- `buyers.js` - Customer data and operations
- `orders.js` - Order lifecycle management
- `production.js` - Production tracking and metrics
- `qc.js` - Quality control data
- `erp-dashboard.js` - Dashboard metrics and KPIs

All stores include:
- Reactive computed properties
- CRUD operations
- Dummy data for development
- Cross-store relationships

## API Integration

### Service Layer
- `services/api.js` - Core API functions (buyers, products, orders)
- `services/erp-api.js` - ERP-specific operations
- Axios interceptors for authentication
- Error handling and loading states

## Routes

The application uses auto-generated routes based on file structure:

- `/app/dashboard` - Main dashboard
- `/app/Buyers` - Customer management
- `/app/Factories` - Factory information
- `/app/Products` - Product catalog
- `/app/Orders` - Order processing
- `/app/Production` - Production tracking
- `/app/QC` - Quality control
- `/app/Decorations` - Design management (placeholder)
- `/app/FarmOut` - Subcontractor results (placeholder)
- `/app/PackingList` - Packing preparation (placeholder)
- `/app/DeliveryNote` - Delivery documentation (placeholder)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development Guidelines

### Code Standards
- Vue 3 Composition API with `<script setup>`
- ESLint with strict rules (function declarations, import ordering)
- Proper TypeScript integration
- Component-based architecture

### UI/UX Patterns
- Consistent use of shadcn-vue components
- Responsive design principles
- Accessible navigation
- Loading and error states

### Internationalization
- All text content uses i18n keys
- Comprehensive translations for ERP terminology
- Dynamic language switching

## Next Steps

### Planned Enhancements
- [ ] VeeValidate integration for form validation
- [ ] Complete implementation of placeholder modules
- [ ] Advanced charts and reporting
- [ ] Real-time notifications
- [ ] Export/import functionality
- [ ] Advanced filtering and search
- [ ] User role management
- [ ] Audit logging

### API Integration
- [ ] Connect to actual backend API
- [ ] Implement authentication system
- [ ] Error handling improvements
- [ ] Offline capabilities

## Project Structure

```
src/
├── components/          # Reusable UI components
├── composables/         # Vue composition functions
├── constants/           # Application constants
├── layouts/            # Page layouts
├── lib/                # Utility functions
├── locales/            # Translation files
├── pages/              # Application pages
├── plugins/            # Vue plugins
├── router/             # Route configuration
├── services/           # API service layer
└── stores/             # Pinia state stores
```

This ERP frontend provides a solid foundation for a modern manufacturing management system with room for future enhancements and customizations.
