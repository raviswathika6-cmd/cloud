# System Architecture

## System Overview

The Cloud Admissions System is a full-stack application for managing student applications with authentication and form submission workflows.

### High-Level Architecture

```mermaid
graph TB
    Client["Frontend Browser"]
    
    subgraph "Node.js Server (Port 3000)"
        NodeServer["Static File Server"]
        NodeAPI["/api/login Handler"]
    end
    
    subgraph "Python Flask Server (Port 5000)"
        FlaskServer["Flask App"]
        AuthEndpoint["/api/login"]
        ApplyEndpoint["/api/apply"]
        ListEndpoint["/api/applications"]
    end
    
    subgraph "Data Layer"
        SQLite["SQLite Database<br/>admissions.db"]
    end
    
    Client -->|GET /login| NodeServer
    Client -->|GET /| NodeServer
    Client -->|POST /api/login| NodeAPI
    Client -->|HTML/CSS/JS| NodeServer
    
    Client -->|POST /api/login| AuthEndpoint
    Client -->|POST /api/apply| ApplyEndpoint
    Client -->|GET /api/applications| ListEndpoint
    
    AuthEndpoint --> SQLite
    ApplyEndpoint --> SQLite
    ListEndpoint --> SQLite
    FlaskServer --> SQLite
```

## Component Interactions

### Request Flow: User Login

```mermaid
sequenceDiagram
    actor User
    participant Client as Browser Client
    participant NodeServer as Node.js Server<br/>Port 3000
    participant FlaskAPI as Flask Backend<br/>Port 5000
    participant DB as SQLite DB
    
    User->>Client: Enter credentials
    Client->>NodeServer: POST /api/login
    NodeServer->>FlaskAPI: POST /api/login (proxy/forward)
    FlaskAPI->>DB: Query user (if implemented)
    DB-->>FlaskAPI: User record
    FlaskAPI-->>NodeServer: JWT Token
    NodeServer-->>Client: Token + User Info
    Client->>Client: Store token in localStorage
    User->>User: Authenticated
```

### Request Flow: Submit Application

```mermaid
sequenceDiagram
    actor Student
    participant Client as Browser Client
    participant FlaskAPI as Flask Backend<br/>Port 5000
    participant DB as SQLite DB
    
    Student->>Client: Fill form & submit
    Client->>Client: Validate form
    Client->>FlaskAPI: POST /api/apply (form data)
    FlaskAPI->>FlaskAPI: Parse & validate
    FlaskAPI->>DB: INSERT Application
    DB-->>FlaskAPI: Confirm + ID
    FlaskAPI-->>Client: Success + App ID
    Client->>Client: Show confirmation
```

### Request Flow: Retrieve Applications

```mermaid
sequenceDiagram
    actor Admin
    participant Client as Browser Client
    participant FlaskAPI as Flask Backend<br/>Port 5000
    participant DB as SQLite DB
    
    Admin->>Client: Request applications list
    Client->>FlaskAPI: GET /api/applications
    FlaskAPI->>DB: SELECT * FROM applications
    DB-->>FlaskAPI: List of applications
    FlaskAPI-->>Client: JSON array
    Client->>Client: Render table
```

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | HTML/CSS/JavaScript | - | Form UI, authentication |
| Frontend Server | Node.js | v14+ | Static file serving on port 3000 |
| Backend | Python Flask | 2.x | REST API on port 5000 |
| Database | SQLite | 3.x | Persistent data storage (admissions.db) |
| ORM | SQLAlchemy | - | Database abstraction layer |

## Deployment Model

- **Frontend Server**: Node.js HTTP server (port 3000)
- **Backend API**: Flask development server (port 5000)
- **Database**: File-based SQLite (embedded with Flask)
- **Static Files**: Served from filesystem via Node.js

## Security Considerations

⚠️ **Current Limitations** (See ADR-002):
- Demo token generation without validation
- No real authentication implementation
- No CORS configuration
- Database file not encrypted
- No rate limiting or request throttling

See [ADR-002-Authentication-Strategy](../decisions/ADR-002-Authentication-Strategy.md) for planned improvements.

## API Gateway Pattern (Planned)

See [ADR-003-API-Gateway-Implementation](../decisions/ADR-003-API-Gateway-Implementation.md) for proposal to consolidate auth logic.
