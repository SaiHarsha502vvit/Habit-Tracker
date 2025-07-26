# Full-Stack Habit Tracker Application with Pomodoro Timer

A comprehensive habit tracking application built with Spring Boot backend and React frontend, featuring GitHub-style contribution graphs, Pomodoro timer functionality, and a modern dark theme UI.

## 📁 Project Structure

```
Small-Java-Project/
├── backend/                    # Spring Boot Application
│   ├── src/
│   │   └── main/
│   │       ├── java/com/habittracker/
│   │       │   ├── config/     # Configuration classes
│   │       │   ├── controller/ # REST controllers
│   │       │   ├── dto/        # Data transfer objects
│   │       │   ├── exception/  # Exception handling
│   │       │   ├── model/      # JPA entities (with Pomodoro support)
│   │       │   ├── repository/ # Data access layer
│   │       │   └── service/    # Business logic
│   │       └── resources/      # Application properties
│   ├── target/                 # Build output
│   └── pom.xml                 # Maven configuration
├── frontend/                   # React Application
│   ├── src/
│   │   ├── app/               # Redux store configuration
│   │   ├── components/        # React components (including timer UI)
│   │   ├── features/          # Redux slices
│   │   ├── hooks/            # Custom hooks (timer session management)
│   │   └── services/          # API services
│   ├── public/                # Static assets
│   ├── package.json           # Node.js dependencies
│   └── vite.config.js         # Vite configuration
└── README.md                  # Project documentation
```

## ✨ Features

### Core Functionality

- **Create Habits**: Add new habits with name and description
- **Habit Types**: Choose between Standard (simple check-off) and Timed (Pomodoro) habits
- **Pomodoro Timer**: Built-in timer functionality for time-based habits
  - Customizable timer duration (1-480 minutes)
  - Visual countdown with progress indicator
  - Browser tab title shows remaining time
  - Audio notification on completion
  - Automatic habit logging upon completion
  - Pause/resume/stop controls
- **Track Completion**: Mark habits as completed for specific dates
- **GitHub-style Visualization**: Contribution graphs showing habit streaks
- **Streak Tracking**: Current streak counter with fire emoji
- **Data Persistence**: H2 in-memory database with seed data
- **Modern UI**: Dark theme with responsive design
- **Real-time Updates**: Optimistic UI updates with error handling

### Technical Features

- **RESTful API**: Comprehensive backend API with Swagger documentation
- **Redux State Management**: Normalized state with memoized selectors
- **Timer Session Management**: Custom React hooks for timer state persistence
- **Browser Integration**: Tab title updates and completion notifications
- **Error Handling**: Global exception handling and user-friendly notifications
- **Form Validation**: Frontend and backend validation
- **Responsive Design**: Works on desktop and mobile
- **Performance**: Optimized with entity adapters and memoized selectors

## 🛠️ Technology Stack

### Backend

- **Spring Boot 3.3.2** - Main framework
- **Spring Data JPA** - Database access layer
- **H2 Database** - In-memory database
- **Hibernate** - ORM mapping
- **Lombok** - Code generation
- **SpringDoc OpenAPI** - API documentation
- **Maven** - Build tool
- **Java 17** - Programming language

### Frontend

- **React 19** - Frontend framework
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **Tailwind CSS v4** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Tooltip** - Interactive tooltips
- **Custom Hooks** - Timer session management and state persistence

## 🚀 Getting Started

### Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Build the application:**

   ```bash
   mvn clean package
   ```

3. **Run the Spring Boot application:**

   ```bash
   java -jar target/habit-tracker-0.0.1-SNAPSHOT.jar
   ```

4. **Verify backend is running:**
   - API: http://localhost:8080/api/habits
   - Swagger UI: http://localhost:8080/swagger-ui.html
   - H2 Console: http://localhost:8080/h2-console (URL: jdbc:h2:mem:testdb)

### Frontend Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open the application:**
   - Frontend: http://localhost:5173

## 📚 API Documentation

### Endpoints

#### Habits

- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create a new habit
- `DELETE /api/habits/{id}` - Delete a habit

#### Habit Logs

- `POST /api/habits/{id}/logs` - Log a habit completion
- `GET /api/habits/{id}/logs?year={year}` - Get completion logs for a year

### Example Requests

**Create a Habit:**

```json
POST /api/habits
{
  "name": "Read for 30 minutes",
  "description": "Daily reading habit to improve knowledge",
  "habitType": "STANDARD"
}
```

**Create a Timed Habit (Pomodoro):**

```json
POST /api/habits
{
  "name": "Deep Work Session",
  "description": "Focused work with Pomodoro technique",
  "habitType": "TIMED",
  "timerDurationMinutes": 25
}
```

**Log Completion:**

```json
POST /api/habits/1/logs
{
  "completionDate": "2025-07-26"
}
```

## 🏗️ Project Structure

### Backend Structure

```
src/main/java/com/habittracker/
├── config/
│   └── DataSeeder.java           # Database seeding
├── controller/
│   └── HabitController.java      # REST endpoints
├── dto/
│   ├── HabitDto.java            # Data transfer objects (with timer support)
│   └── HabitLogDto.java
├── exception/
│   ├── GlobalExceptionHandler.java  # Global error handling
│   ├── ResourceNotFoundException.java
│   └── ErrorResponse.java
├── model/
│   ├── Habit.java               # JPA entities (with HabitType enum)
│   └── HabitLog.java
├── repository/
│   ├── HabitRepository.java     # Data access layer
│   └── HabitLogRepository.java
├── service/
│   └── HabitService.java        # Business logic
└── HabitTrackerApplication.java # Main application class
```

### Frontend Structure

```
src/
├── app/
│   ├── store.js                 # Redux store configuration
│   └── hooks.js                 # Typed Redux hooks
├── components/
│   ├── AddHabitForm.jsx         # Habit creation form (with timer options)
│   ├── HabitItem.jsx            # Individual habit display (with timer integration)
│   ├── HabitList.jsx            # Habits list container
│   ├── ContributionGraph.jsx    # GitHub-style graph
│   └── TimerSession.jsx         # Pomodoro timer component
├── features/
│   └── habits/
│       └── habitsSlice.js       # Redux slice for habits
├── hooks/
│   └── useTimerSession.js       # Custom hook for timer management
├── services/
│   └── api.js                   # Axios API client
├── App.jsx                      # Main app component
├── main.jsx                     # App entry point
└── index.css                    # Global styles with Tailwind
```

## 🎯 Key Features Explained

### Pomodoro Timer Integration

- **Seamless Integration** with habit tracking workflow
- **Flexible Duration** from 1 to 480 minutes (8 hours)
- **Browser Tab Updates** showing countdown timer
- **Automatic Logging** of completed sessions
- **Visual Progress** with circular progress indicator
- **Session Controls** for pause, resume, and stop
- **Completion Notifications** with success toasts
- **Persistent State** maintains timer across page refreshes

### Contribution Graph

- **GitHub-style visualization** showing habit completion patterns
- **Color-coded squares** indicating completion frequency
- **Tooltips** showing completion dates and status
- **Yearly view** with proper calendar alignment
- **Responsive design** that works on all screen sizes

### State Management

- **Normalized state** using Redux entity adapters for optimal performance
- **Memoized selectors** to prevent unnecessary re-renders
- **Optimistic updates** for better user experience
- **Error handling** with automatic rollback on failures
- **Timer state persistence** across component re-renders
- **Session management** with unique session IDs

### Backend Architecture

- **Service layer pattern** with clear separation of concerns
- **DTO pattern** for API data transfer
- **Global exception handling** with standardized error responses
- **JPA relationships** with proper constraints
- **Idempotent operations** for habit logging
- **Enum-based habit types** for extensible habit categorization
- **Database schema** supporting both standard and timed habits

## 🧪 Testing

### Backend Tests

```bash
cd e:\Coding\Small-Java-Project
mvn test
```

### Unit Test Coverage

- ✅ **HabitService idempotency test** - Ensures duplicate habit logs aren't created
- ✅ **Service layer validation** - Tests business logic
- **Future tests** can be added for controllers, repositories, and integration testing

## 🔧 Configuration

### Environment Variables

- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:8080)

### Database Configuration

- **H2 In-Memory Database** for development
- **Automatic seeding** with sample habits and logs
- **DDL auto-generation** for easy development

## 📈 Performance Optimizations

### Frontend

- **Memoized selectors** prevent unnecessary re-renders
- **Entity normalization** for efficient state updates
- **Optimistic updates** for instant UI feedback
- **Component memoization** where appropriate
- **Custom hooks** for timer state management
- **Efficient interval management** to prevent memory leaks

### Backend

- **Efficient queries** with proper indexing
- **Lazy loading** configuration
- **Connection pooling** with HikariCP
- **Pagination ready** (can be extended)

## 🎨 UI/UX Features

- **Dark theme** optimized for extended use
- **Smooth animations** and transitions
- **Responsive design** for all devices
- **Accessibility** considerations
- **Toast notifications** for user feedback
- **Loading states** and error handling
- **Intuitive timer controls** with visual feedback
- **Real-time countdown** in browser tab
- **Progress indicators** for timer sessions
- **Completion celebrations** with success animations

## 🚀 Deployment Considerations

### Production Enhancements

1. **Database**: Replace H2 with PostgreSQL/MySQL
2. **Security**: Add authentication and authorization
3. **Monitoring**: Add application monitoring and logging
4. **Testing**: Expand test coverage
5. **Docker**: Containerize the application
6. **CI/CD**: Set up automated deployments

### Configuration for Production

- Environment-specific configurations
- Database connection settings
- CORS configuration for production domains
- Logging levels and monitoring

## 📝 Development Notes

### Code Quality

- **Consistent naming conventions** throughout the application
- **Comprehensive JavaDoc** documentation
- **TypeScript-style JSDoc** comments in React components
- **Error boundaries** and graceful error handling
- **Lint-free code** with ESLint configuration

### Architecture Decisions

- **REST over GraphQL** for simplicity and standardization
- **Redux Toolkit** over plain Redux for reduced boilerplate
- **Tailwind CSS** for rapid UI development
- **Entity adapter pattern** for normalized state management
- **Service layer pattern** for business logic separation
- **Custom hooks pattern** for reusable timer logic
- **Enum-based typing** for habit categorization
- **Separate timer state management** from main Redux store for performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Built with ❤️ using Spring Boot and React**

## 🔥 New Features in v2.0

### Pomodoro Timer Integration

- Complete timer functionality for focused work sessions
- Visual countdown with progress indicators
- Browser tab integration showing remaining time
- Automatic habit completion upon timer finish
- Pause, resume, and stop controls
- Customizable timer durations (1-480 minutes)
- Audio notifications on completion
- Session state persistence

### Enhanced Habit Management

- Two habit types: Standard (check-off) and Timed (Pomodoro)
- Flexible timer durations for different work styles
- Improved form validation with timer-specific options
- Enhanced UI with timer controls integration

### Technical Improvements

- Custom React hooks for timer session management
- Optimized state management for timer operations
- Memory leak prevention with proper cleanup
- Enhanced error handling for timer operations
- Performance optimizations for real-time updates
