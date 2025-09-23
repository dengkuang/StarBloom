# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StarBloom is a WeChat Mini Program for children's behavior incentive management. It's a points-based reward system that helps parents cultivate good habits in children through gamified tasks and rewards.

**Key Technologies:**
- WeChat Mini Program (WXML/WXSS/JavaScript)
- WeChat Cloud Development (Serverless)
- WeChat Cloud Database (NoSQL)
- WeChat Cloud Storage

**Cloud Environment:** `cloud1-2ghnni8r13cb9f60`

## Development Commands

### WeChat Developer Tools
- **Development**: Use WeChat Developer Tools for local development
- **Cloud Function Deployment**: Deploy through WeChat DevTools interface
- **Database Management**: Use WeChat DevTools database console
- **Testing**: WeChat DevTools simulator and real device debugging

### Cloud Functions
All cloud functions follow a standardized pattern in `/cloudfunctions/`:
```javascript
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, data } = event

  try {
    switch (action) {
      case 'list': return await listItems(data)
      case 'create': return await createItem(data, wxContext.OPENID)
      case 'update': return await updateItem(data)
      case 'delete': return await deleteItem(data)
      default: return { code: -1, message: '未知操作' }
    }
  } catch (error) {
    return handleError(action, error)
  }
}
```

### Database Setup
Database initialization is handled by `initDatabase` cloud function. The system uses 13 core collections:
- users, children, tasks, task_completion_records
- rewards, exchange_records, point_records
- task_templates, reward_templates, dictionaries
- template_usage_records, template_import_export_records, achievements

## Architecture Overview

### Core Components

**API Service Layer** (`utils/api-services.js`):
- Centralized API calls to cloud functions
- Comprehensive business APIs for all modules
- Error handling and response standardization

**Business Data Manager** (`utils/businessDataManager.js`):
- Unified data caching and management
- Global child state management across pages
- User preference persistence
- Data synchronization utilities

**Global Child Manager** (`utils/global-child-manager.js`):
- Maintains current child context across all pages
- Handles child switching and data updates
- Event system for cross-page communication

### Page Structure

**Main Pages** (configured in `app.json`):
- `index/` - Home page with parent dashboard
- `parent/` - Parent management interface
- `child/` - Children's game view interface
- `tasks/` - Task management (add/edit pages included)
- `rewards/` - Reward store/exchange (add/edit pages included)
- `points/` - Points center and history
- `analysis/` - Data analysis and reports
- `settings/` - System settings
- `dictionary/` - Dictionary configuration management
- `templates/` - Preset template management
- `template-management/` - Template admin interface
- `template-editor/` - Template editing interface
- `template-debug/` - Template debugging interface

### Cloud Functions

**Core Business Functions:**
- `getUserInfo` - User authentication and management
- `manageChildren` - Children CRUD operations
- `manageTasks` - Task lifecycle management
- `manageRewards` - Reward system management
- `managePoints` - Points calculation and tracking
- `dataAnalysis` - Analytics and reporting

**Template System Functions:**
- `manageTemplates` - Preset template management
- `manageTemplateData` - Template data operations
- `importExportTemplates` - Template import/export
- `manageDictionary` - System dictionary management

**Initialization Functions:**
- `initDatabase` - Database initialization
- `initDefaultRewards` - Default rewards setup

## Key Development Patterns

### Data Management
Always use `businessDataManager.js` for consistent data handling:
```javascript
const { businessDataManager } = require('../../utils/data-manager')

// Set current child context
businessDataManager.setCurrentChild(childData)

// Get cached user info
const userInfo = businessDataManager.getUserInfo()

// Cache with expiry
businessDataManager.set('key', data, 300000) // 5 minutes
```

### API Calls
Use the centralized API service layer:
```javascript
const { childrenApi, tasksApi, rewardsApi } = require('../../utils/api-services')

// Standard CRUD operations
const children = await childrenApi.getList()
const result = await tasksApi.create(taskData)
```

### Cloud Function Development
Follow the established pattern:
- Unified error handling with proper HTTP status codes
- Permission validation using `wxContext.OPENID`
- Input validation and sanitization
- Consistent response format: `{ code: 0, data: {}, message: '' }`

### Template System
The template system provides age-appropriate presets:
- **Grade 1 Templates**: 6-year-old children with focus on basic habits
- Template categories: study, life, exercise, social, family
- Smart recommendations based on child age
- Batch import functionality for quick setup

### UI Components
Use existing components for consistency:
- `child-card/` - Child profile display
- `task-item/` - Task list items
- `reward-item/` - Reward display
- `stat-card/` - Statistics display
- `template-card/` - Template selection

## Database Schema

### Core Collections
1. **users** - User accounts and permissions
2. **children** - Children profiles with points tracking
3. **tasks** - Task definitions and assignments
4. **task_completion_records** - Task completion tracking
5. **rewards** - Reward catalog
6. **exchange_records** - Reward redemption
7. **point_records** - Points transaction history
8. **task_templates** - Reusable task templates
9. **reward_templates** - Reusable reward templates
10. **dictionaries** - System configuration data
11. **template_usage_records** - Template usage analytics
12. **template_import_export_records** - Import/export tracking
13. **achievements** - Achievement and badge system

### Key Indexes
The system uses optimized indexes for performance:
- Children: `parentId` for family-based queries
- Tasks: `parentId`, `childIds`, `status` for filtering
- Points: `childId`, `recordTime` for chronological queries
- Templates: `ageGroup`, `category`, `isActive` for recommendations

## Business Logic

### Points System
- **Base Points**: Task-defined point values
- **Difficulty Bonus**: 10%-50% additional points
- **Consecutive Bonus**: 20% for streak maintenance
- **Perfect Day**: 50% bonus for completing all daily tasks
- **Challenge Rewards**: Special rewards for challenge completion

### Task Completion Flow
1. Task selection and validation
2. Completion status recording
3. Points calculation with bonuses
4. Child points balance update
5. Achievement system trigger
6. Challenge progress update

### Reward Exchange Process
1. Points balance validation
2. Stock availability check
3. Exchange record creation
4. Points deduction
5. Inventory update
6. Parent approval workflow

## Design System

### Visual Design
- **Primary Color**: `#6667eea` (indigo) representing growth
- **Secondary Colors**: Light indigo variants for different states
- **Accent Colors**: Orange (#FF9800), red (#F44336) for alerts
- **Typography**: PingFang font family
- **UI Pattern**: Card-based layouts with rounded corners

### Theme Elements
- **Brand IP**: Star-themed elements and imagery
- **Design Style**: Child-friendly, rounded corners, playful
- **Layout**: Responsive grid and flexbox layouts
- **Iconography**: Consistent star and achievement icons

## Development Guidelines

### Code Standards
- Use ES6+ JavaScript features
- Follow WeChat Mini Program API conventions
- Implement proper error handling in all cloud functions
- Use async/await for asynchronous operations
- Maintain consistent naming conventions (camelCase for variables/functions)

### State Management
- Use `businessDataManager` for cross-page data consistency
- Implement proper caching strategies
- Handle global child state carefully
- Use event system for real-time updates

### Security Considerations
- Validate all user inputs
- Implement proper permission checks using `wxContext.OPENID`
- Never expose sensitive data in client-side code
- Use WeChat Cloud Development security rules
- Log important operations for audit trails

### Performance Optimization
- Implement data caching where appropriate
- Use pagination for large datasets
- Optimize database queries with proper indexes
- Lazy load non-critical resources
- Implement request deduplication

### Template Development
- Use existing template system for new features
- Follow age-appropriate content guidelines
- Implement template usage tracking
- Support template customization and import/export
- Provide clear template previews and descriptions

## Testing

### WeChat Mini Program Testing
- Use WeChat Developer Tools simulator
- Test on real devices for different screen sizes
- Verify cloud function responses in development environment
- Test data persistence and synchronization

### Cloud Function Testing
- Test each cloud function action independently
- Verify error handling and edge cases
- Test permission validation
- Validate data integrity

### Data Validation
- Test all CRUD operations
- Verify points calculation accuracy
- Test template import/export functionality
- Validate achievement system triggers

## Deployment

### Cloud Function Deployment
1. Update cloud function code in respective directories
2. Use WeChat DevTools to deploy functions
3. Test in development environment first
4. Monitor function logs for errors

### Database Updates
1. Test schema changes in development environment
2. Update database indexes as needed
3. Verify data migration scripts
4. Monitor query performance

### Production Release
1. Backup existing data before major changes
2. Deploy during low-traffic periods
3. Monitor system performance post-release
4. Prepare rollback procedures if needed

## Image Management

### SVG Theme Colors
- **Normal state**: `#6667eea` (indigo)
- **Active state**: `#5558cc` (darker indigo)
- Use the provided SVG compression scripts when needed

### PNG Compression
- Use `simple_png_compressor.py` for PNG image compression
- Target file size: under 1MB
- Uses Pillow library for lossless compression
- Run with: `python simple_png_compressor.py`

