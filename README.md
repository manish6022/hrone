# Pammi Greenland - Modern HR Management System

A comprehensive, enterprise-grade HR management system built with Next.js 16, TypeScript, and TailwindCSS. Features a stunning modern design with glassmorphism effects, advanced animations, and a sophisticated user experience.

![Pammi Greenland Logo](https://via.placeholder.com/150x50/3b82f6/ffffff?text=HROne)

## 🌟 Key Features

### 🎨 **Modern Design System**
- **Glassmorphic UI** with backdrop blur effects
- **Advanced animations** powered by Framer Motion
- **Gradient-based color schemes** with professional aesthetics
- **Responsive design** optimized for all devices
- **Dark theme support** with smooth transitions

### 👥 **Core HR Modules**
- **Employee Management** - Complete employee directory with advanced search
- **Attendance Tracking** - Real-time attendance with multiple tracking methods
- **Leave Management** - Digital leave requests with approval workflows
- **Payroll System** - Automated salary processing with statutory compliance
- **Performance Management** - Goal setting and appraisal cycles
- **Production Tracking** - Piece-rate and production monitoring
- **Reports & Analytics** - Comprehensive business intelligence

### 🔐 **Enterprise Security**
- **Role-Based Access Control (RBAC)** with granular permissions
- **JWT-based authentication** with secure session management
- **Data encryption** (AES/RSA) for sensitive information
- **Audit logging** for complete activity tracking
- **Multi-factor authentication** support

### ⚡ **Performance & Reliability**
- **Memory leak prevention** with robust cleanup patterns
- **Optimized animations** with hardware acceleration
- **Error boundaries** for graceful error handling
- **Request cancellation** to prevent memory leaks
- **Production-ready** with comprehensive testing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/hrone.git
cd hrone

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
# Start the development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📋 Module Overview

### 👥 **Employee Management** (`/employees`)
- Complete employee profiles with personal and professional information
- Advanced search by name, email, department, or designation
- Bulk operations for efficient management
- Department-wise organization with visual indicators
- Role assignment and permission management

### ⏰ **Attendance Management** (`/attendance`)
- Real-time attendance monitoring with check-in/check-out
- Multiple tracking methods (biometric, manual, GPS)
- Work hours calculation with overtime tracking
- Department-wise analytics and trend analysis
- Exception handling for late marks and absenteeism

### 🏖️ **Leave Management** (`/leave`)
- Digital leave request system with workflow automation
- Configurable leave types (Casual, Sick, Paid, Unpaid)
- Automatic leave balance calculation with carry-forward
- Multi-level approval system with notifications
- Leave encashment support and analytics

### 💰 **Payroll Management** (`/payroll`)
- Comprehensive salary structure configuration
- Automated processing based on attendance and leave
- Statutory compliance (TDS, PF, ESI calculations)
- PDF payslip generation with detailed breakdown
- Bank integration for automated disbursement

### 📊 **Performance Management** (`/performance`)
- Goal setting and KPI definition
- Structured appraisal cycles with 360-degree feedback
- Self-assessment and manager evaluation forms
- Performance-linked salary revisions
- Complete appraisal history tracking

### 🏭 **Production Tracking** (`/production`)
- Item master management with configurable rates
- Employee/contractor production logging
- Real-time payment preview and calculations
- Approval workflow for production verification
- Payroll integration for seamless processing

### 📈 **Reports & Analytics** (`/reports`)
- Comprehensive data exports (PDF, Excel, CSV)
- Visual KPI dashboards with real-time updates
- Department-wise performance metrics
- Trend analysis and historical data patterns
- Custom report builder with configurable parameters

## 🛠️ Technical Stack

### **Frontend**
- **Framework**: Next.js 16.1.6 with App Router
- **Language**: TypeScript 5
- **Styling**: TailwindCSS v4 with custom design system
- **Animations**: Framer Motion for premium interactions
- **Icons**: Lucide React
- **HTTP Client**: Axios with interceptors

### **Backend Requirements**
- **API**: RESTful services architecture
- **Authentication**: JWT-based authentication system
- **Database**: PostgreSQL (production), MySQL (compatibility)
- **File Storage**: Document management system
- **Notifications**: Email and in-app notification system

### **Development Tools**
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Testing**: Jest, React Testing Library
- **Build Tools**: Next.js optimized build pipeline
- **Deployment**: Vercel, Docker support

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
API_SECRET_KEY=your-secret-key

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/hrone

# Authentication
JWT_SECRET=your-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret

# Email Service (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Database Setup

```bash
# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

## 🎨 Design System

### **Color Palette**
- **Primary**: Indigo/Purple gradients (`#3b82f6` to `#6366f1`)
- **Success**: Emerald/Green (`#10b981` to `#059669`)
- **Warning**: Amber/Orange (`#f59e0b` to `#d97706`)
- **Error**: Red (`#ef4444` to `#dc2626`)
- **Neutral**: Slate grays (`#1e293b` to `#f8fafc`)

### **Typography**
- **Font Family**: Geist (modern sans-serif)
- **Headings**: Bold weights with generous spacing
- **Body**: Regular weight with optimal line height
- **Code**: Monospace with syntax highlighting

### **Components**
- **Glassmorphic Cards**: Backdrop blur with transparency
- **Animated Buttons**: Scale and hover effects
- **Interactive Forms**: Real-time validation
- **Data Tables**: Sortable, filterable, responsive
- **Charts**: Visual data representation

## 🔐 Security Features

### **Authentication & Authorization**
- JWT-based authentication with secure token management
- Role-based access control with granular permissions
- Session management with automatic timeout
- Multi-factor authentication support

### **Data Protection**
- AES encryption for sensitive data at rest
- RSA encryption for data in transit
- Secure password hashing with bcrypt
- GDPR compliance features

### **Audit & Monitoring**
- Complete activity logging with user tracking
- Change history maintenance for all records
- Security event monitoring and alerts
- Compliance reporting capabilities

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px - 1280px
- **Large Desktop**: 1280px+

### **Mobile Optimization**
- Touch-friendly interactions with larger hit areas
- Adaptive layouts for smaller screens
- Optimized performance for mobile devices
- Gesture support for common actions

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### **Docker**
```bash
# Build Docker image
docker build -t Pammi Greenland .

# Run container
docker run -p 3000:3000 hrone
```

### **Traditional Hosting**
```bash
# Build application
npm run build

# Start production server
npm start
```

## 📊 Performance

### **Optimization Features**
- Code splitting and lazy loading
- Image optimization with Next.js Image component
- Caching strategies for improved performance
- Database query optimization
- CDN integration for static assets

### **Monitoring**
- Application performance monitoring (APM)
- Error tracking and reporting
- User analytics and behavior tracking
- System health monitoring

## 🧪 Testing

### **Unit Tests**
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### **E2E Tests**
```bash
# Run end-to-end tests
npm run test:e2e
```

### **Performance Tests**
```bash
# Run performance tests
npm run test:performance
```

## 📚 Documentation

### **API Documentation**
- Complete REST API documentation
- Authentication and authorization guides
- Error handling and response formats
- Rate limiting and usage guidelines

### **User Guides**
- Employee handbook for system usage
- Administrator guide for system management
- Troubleshooting common issues
- Best practices and recommendations

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Code Standards**
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write comprehensive tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Getting Help**
- 📧 Email: support@hrone.com
- 💬 Discord: [Join our community](https://discord.gg/hrone)
- 📖 Documentation: [docs.hrone.com](https://docs.hrone.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/hrone/issues)

### **Community**
- Join our Discord community for real-time support
- Follow us on Twitter for updates and tips
- Subscribe to our newsletter for the latest features
- Check out our blog for tutorials and best practices

---

## 🎉 What's Next?

### **Roadmap**
- **Mobile Application** - Native iOS and Android apps
- **AI Integration** - Advanced analytics and predictions
- **Advanced Reporting** - Custom report builder
- **Integration Marketplace** - Third-party app integrations
- **Multi-tenant Architecture** - SaaS deployment options

### **Current Version**
- **Version**: 2.0.0
- **Release Date**: January 2024
- **Compatibility**: Next.js 16+, Node.js 18+
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+

---

**Built with ❤️ by the Pammi Greenland team**

*Transforming HR management with modern technology and beautiful design.*
