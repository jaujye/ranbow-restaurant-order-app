# Ranbow Restaurant Order Application

## Quick Start

1. **Read CLAUDE.md first** - Contains essential rules for Claude Code
2. Follow the pre-task compliance checklist before starting any work
3. Use proper module structure under `src/main/java/`
4. Commit after every completed task

## Project Description

使用者可以透過這個手機應用程式來進行點餐並且付款，管理員可使用本應用程式完成訂單並查看統計營收

## Standard Project Structure

This project follows Java enterprise conventions with modular organization:

```
src/main/java/com/ranbow/restaurant/
├── core/      # Core business logic
├── utils/     # Utility functions/classes
├── models/    # Data models/entities
├── services/  # Service layer
└── api/       # API endpoints/interfaces
```

## Development Guidelines

- **Always search first** before creating new files
- **Extend existing** functionality rather than duplicating  
- **Use Task agents** for operations >30 seconds
- **Single source of truth** for all functionality
- **Java conventions** - follows Maven/Gradle standards
- **Scalable** - enterprise-ready structure