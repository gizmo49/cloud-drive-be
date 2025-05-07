# Cloud Drive Backend

A robust Node.js backend service for the Cloud Drive application, providing secure file storage and management capabilities.

## Features

- User authentication and authorization
- File upload and management
- Folder organization
- AWS S3 integration for file storage
- RESTful API architecture

## Tech Stack

- Node.js with Express
- TypeScript
- PostgreSQL Database
- AWS S3 for file storage
- Docker support

## Project Structure

```
src/
├── app.ts                 # Application entry point
├── config/               # Configuration files
├── controllers/          # Request handlers
├── interfaces/           # TypeScript interfaces
├── lib/                  # External service integrations
├── middleware/           # Express middlewares
├── models/               # Database models
├── routes/               # API routes
├── services/             # Business logic
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- AWS Account (for S3)
- Docker (optional)

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and update the variables:
   ```
   # Server
   PORT=3000
   NODE_ENV=development

   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=clouddrive
   DB_USER=postgres
   DB_PASSWORD=your_password

   # AWS
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=your_region
   AWS_BUCKET_NAME=your_bucket_name

   # JWT
   JWT_SECRET=your_jwt_secret
   ```

### Installation

```bash
# Install dependencies
yarn install

# Build the project
yarn build

# Start development server
yarn dev

# Start production server
yarn start
```

### Using Docker

```bash
# Start services with Docker Compose
docker-compose up -d

# Stop services
docker-compose down
```

## API Documentation

### Authentication

```
POST /api/auth/register - Register new user
POST /api/auth/login    - Login user
POST /api/auth/logout   - Logout user
```

### Files

```
GET    /api/files          - List all files
POST   /api/files          - Upload new file
GET    /api/files/:id      - Get file details
DELETE /api/files/:id      - Delete file
```

### Folders

```
GET    /api/folders          - List all folders
POST   /api/folders          - Create new folder
GET    /api/folders/:id      - Get folder contents
PATCH  /api/folders/:id      - Update folder
DELETE /api/folders/:id      - Delete folder
```

## Development

### Available Scripts

```bash
yarn dev      # Start development server
yarn build    # Build for production
yarn start    # Start production server
yarn test     # Run tests
yarn lint     # Run linter
```


## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.