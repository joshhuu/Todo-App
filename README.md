# TaskFlow - Modern Todo App

A clean, feature-rich todo list application built with vanilla JavaScript. No frameworks, no dependencies - just pure HTML, CSS, and JavaScript.

## Features

### Core Functionality
- Add, edit, and delete tasks
- Mark tasks as complete/incomplete
- Task search with real-time filtering
- Clear all completed tasks at once
- Automatic data persistence (localStorage)

### Task Organization
- **Categories**: Organize tasks into General, Work, Personal, Shopping, or Health
- **Priority Levels**: Set tasks as Low, Medium, or High priority with color-coded badges
- **Due Dates**: Add deadlines to tasks and get visual warnings for overdue items
- **Smart Filtering**: Filter by status (all/active/completed) or priority level
- **Flexible Sorting**: Sort tasks by date created or priority level

### UI/UX
- Light and dark mode with smooth transitions
- Responsive design that works on all screen sizes
- Smooth animations for adding, editing, and removing tasks
- Toast notifications for user actions
- Empty state when no tasks exist
- Keyboard shortcuts (Escape to close modals, Ctrl/Cmd+K for search)

### Usage

**Adding a Task:**
1. Type your task in the input field
2. Optionally select a category, priority, and due date
3. Press Enter or click "Add Task"

**Managing Tasks:**
- Click the checkbox to mark a task complete
- Click the edit icon (✏️) to modify task details
- Click the delete icon (🗑️) to remove a task
- Use the search bar to find specific tasks
- Filter and sort buttons help you focus on what matters

**Theme Toggle:**
Click the moon/sun icon in the header to switch between light and dark modes.

## Project Structure

```
todo-app/
├── index.html      # Main HTML structure
├── styles.css      # All styling and animations
├── app.js          # Application logic
└── README.md       # You are here
```

## Technologies Used

- **HTML5** - Semantic markup with accessibility in mind
- **CSS3** - Custom properties for theming, flexbox/grid for layout
- **Vanilla JavaScript** - ES6+ features, no libraries or frameworks
- **localStorage API** - For persisting tasks between sessions


## License

Feel free to use this project however you'd like. No restrictions.

## Contributing

Found a bug or have a suggestion? Feel free to open an issue or submit a pull request!

---

## Made by Joshua S