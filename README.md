# Full-Stack Habit Tracker Application

A comprehensive habit tracking application built with Spring Boot backend and React frontend, featuring GitHub-style contribution graphs and a modern dark theme UI.

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
│   │       │   ├── model/      # JPA entities
│   │       │   ├── repository/ # Data access layer
│   │       │   └── service/    # Business logic
│   │       └── resources/      # Application properties
│   ├── target/                 # Build output
│   └── pom.xml                 # Maven configuration
├── frontend/                   # React Application
│   ├── src/
│   │   ├── app/               # Redux store configuration
│   │   ├── components/        # React components
│   │   ├── features/          # Redux slices
│   │   └── services/          # API services
│   ├── public/                # Static assets
│   ├── package.json           # Node.js dependencies
│   └── vite.config.js         # Vite configuration
└── README.md                  # Project documentation
```

## ✨ Features

### Core Functionality

- **Create Habits**: Add new habits with name and description
- **Track Completion**: Mark habits as completed for specific dates
- **GitHub-style Visualization**: Contribution graphs showing habit streaks
- **Streak Tracking**: Current streak counter with fire emoji
- **Data Persistence**: H2 in-memory database with seed data
- **Modern UI**: Dark theme with responsive design
- **Real-time Updates**: Optimistic UI updates with error handling

### Technical Features

- **RESTful API**: Comprehensive backend API with Swagger documentation
- **Redux State Management**: Normalized state with memoized selectors
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
  "description": "Daily reading habit to improve knowledge"
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
│   ├── HabitDto.java            # Data transfer objects
│   └── HabitLogDto.java
├── exception/
│   ├── GlobalExceptionHandler.java  # Global error handling
│   ├── ResourceNotFoundException.java
│   └── ErrorResponse.java
├── model/
│   ├── Habit.java               # JPA entities
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
│   ├── AddHabitForm.jsx         # Habit creation form
│   ├── HabitItem.jsx            # Individual habit display
│   ├── HabitList.jsx            # Habits list container
│   └── ContributionGraph.jsx    # GitHub-style graph
├── features/
│   └── habits/
│       └── habitsSlice.js       # Redux slice for habits
├── services/
│   └── api.js                   # Axios API client
├── App.jsx                      # Main app component
├── main.jsx                     # App entry point
└── index.css                    # Global styles with Tailwind
```

## 🎯 Key Features Explained

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

### Backend Architecture

- **Service layer pattern** with clear separation of concerns
- **DTO pattern** for API data transfer
- **Global exception handling** with standardized error responses
- **JPA relationships** with proper constraints
- **Idempotent operations** for habit logging

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using Spring Boot and React**
