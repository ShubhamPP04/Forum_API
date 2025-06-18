# Forum API

A robust, scalable, and well-documented Forum API built with Node.js, Express.js, and MongoDB. This API handles backend logic and data storage for posts, comments, and voting functionality, focusing on clean code, RESTful design, and secure API practices.

## Table of Contents

- [Features](#features)
- [Technical Stack](#technical-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Usage](#api-usage)
- [Database Schema](#database-schema)
- [Design Decisions](#design-decisions)
- [Future Enhancements (Bonus Features)](#future-enhancements-bonus-features)

## Features

### Core Features

1.  **User Authentication and Authorization:**
    *   User registration and login using JWT token-based authentication.
    *   Secure endpoints, allowing only authenticated users to interact with the API.
    *   Only the author can update or delete their own posts/comments.
2.  **CRUD Operations for Posts:**
    *   Create, read, update, and delete forum posts.
3.  **CRUD Operations for Comments:**
    *   Allow users to comment on posts.
    *   Support nested comments (replies to comments).
4.  **Voting System:**
    *   Users can upvote or downvote posts and comments.
    *   Each user can vote only once per post or comment.
    *   Ability to change or remove their vote.
5.  **Pagination and Filtering:**
    *   Pagination for listing posts and comments.
    *   Support filtering posts by user, date, or popularity.
6.  **API Documentation:**
    *   Clear API documentation using Swagger/OpenAPI.
7.  **Input Validation and Error Handling:**
    *   Validate all incoming data and handle errors gracefully with appropriate HTTP status codes and messages.
8.  **Database Integration:**
    *   MongoDB (with Mongoose) for data storage.
    *   Efficient and normalized data models for users, posts, comments, and votes.

### Bonus Features (Planned for future)

*   Rate limiting to prevent abuse.
*   Soft delete functionality for posts and comments.
*   Tagging or categorization of posts.
*   Admin endpoints for moderation.
*   Search functionality for posts and comments.
*   Unit and integration tests for critical endpoints.

## Technical Stack

*   **Node.js** (v14 or higher)
*   **Express.js**: Web framework
*   **MongoDB**: NoSQL Database
*   **Mongoose**: MongoDB Object Data Modeling (ODM)
*   **JWT (jsonwebtoken)**: For authentication
*   **bcryptjs**: For password hashing
*   **dotenv**: For environment variable management
*   **express-validator**: For input validation
*   **swagger-jsdoc & swagger-ui-express**: For API documentation

## Project Structure

```
/Forum_API
├── src/
│   ├── config/             # Environment variables, database connection
│   ├── middleware/         # Authentication, error handling
│   ├── models/             # Mongoose schemas for User, Post, Comment, Vote
│   ├── routes/             # API endpoints
│   ├── controllers/        # Request handlers, business logic orchestration
│   ├── services/           # Reusable business logic (e.g., pagination, filtering)
│   ├── utils/              # Utility functions (e.g., JWT generation)
│   ├── app.js              # Express application setup
│   └── server.js           # Server entry point
├── docs/                   # API documentation (Swagger/OpenAPI YAML/JSON)
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies and scripts
├── README.md               # Project setup, usage, design decisions
```

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd Forum_API
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the root directory of the project based on `.env.example`.
    ```
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/forum_api
    JWT_SECRET=your_jwt_secret_key
    JWT_EXPIRES_IN=1h
    ```
    *   `MONGO_URI`: Your MongoDB connection string. If running locally, ensure MongoDB is installed and running.
    *   `JWT_SECRET`: A strong, random string for JWT signing.
    *   `JWT_EXPIRES_IN`: Token expiration time (e.g., `1h`, `7d`).

4.  **Run the application:**
    ```bash
    node src/server.js
    ```
    The API will be running on `http://localhost:5000`.

## Environment Variables

*   `PORT`: Port on which the server will run (default: 5000)
*   `MONGO_URI`: MongoDB connection URI
*   `JWT_SECRET`: Secret key for signing JWT tokens
*   `JWT_EXPIRES_IN`: Expiration time for JWT tokens (e.g., `1h`, `7d`)

## API Usage

The API documentation is available via Swagger UI at `http://localhost:5000/api-docs`.

### Authentication

*   **Register User:** `POST /api/auth/register`
    *   Body: `{ "username": "testuser", "email": "test@example.com", "password": "password123" }`
*   **Login User:** `POST /api/auth/login`
    *   Body: `{ "email": "test@example.com", "password": "password123" }`
    *   Returns a JWT token to be used in `Authorization: Bearer <token>` header for protected routes.

### Posts

*   **Create Post:** `POST /api/posts` (Protected)
    *   Body: `{ "title": "My First Post", "content": "This is the content of my first post." }`
*   **Get All Posts:** `GET /api/posts`
    *   Query Params: `?page=1&limit=10&sortBy=createdAt&order=desc&author=<userId>&search=keyword`
*   **Get Single Post:** `GET /api/posts/:id`
*   **Update Post:** `PUT /api/posts/:id` (Protected, Author only)
    *   Body: `{ "title": "Updated Title", "content": "Updated content." }`
*   **Delete Post:** `DELETE /api/posts/:id` (Protected, Author only)

### Comments

*   **Add Comment to Post:** `POST /api/posts/:postId/comments` (Protected)
    *   Body: `{ "content": "This is a comment." }`
*   **Reply to Comment:** `POST /api/comments/:commentId/replies` (Protected)
    *   Body: `{ "content": "This is a reply to a comment." }`
*   **Get Comments for Post:** `GET /api/posts/:postId/comments`
    *   Query Params: `?page=1&limit=10`
*   **Update Comment:** `PUT /api/comments/:id` (Protected, Author only)
    *   Body: `{ "content": "Updated comment content." }`
*   **Delete Comment:** `DELETE /api/comments/:id` (Protected, Author only)

### Votes

*   **Vote on Post/Comment:** `POST /api/:targetType/:targetId/vote` (Protected)
    *   `targetType`: `posts` or `comments`
    *   `targetId`: ID of the post or comment
    *   Body: `{ "value": 1 }` (1 for upvote, -1 for downvote)

## Database Schema

### User Model

*   `username`: String, unique, required
*   `email`: String, unique, required, email format
*   `password`: String, required, minlength 6, hashed
*   `role`: String, enum ['user', 'admin'], default 'user'
*   `createdAt`: Date

### Post Model

*   `title`: String, required, trim, maxlength 100
*   `content`: String, required
*   `author`: ObjectId (ref: 'User'), required
*   `upvotes`: Number, default 0
*   `downvotes`: Number, default 0
*   `createdAt`: Date
*   `updatedAt`: Date

### Comment Model

*   `content`: String, required
*   `author`: ObjectId (ref: 'User'), required
*   `post`: ObjectId (ref: 'Post'), required
*   `parentComment`: ObjectId (ref: 'Comment'), nullable (for nested comments)
*   `upvotes`: Number, default 0
*   `downvotes`: Number, default 0
*   `createdAt`: Date
*   `updatedAt`: Date

### Vote Model

*   `user`: ObjectId (ref: 'User'), required
*   `targetType`: String, enum ['Post', 'Comment'], required (dynamically references Post or Comment)
*   `targetId`: ObjectId, required (refPath: 'targetType')
*   `value`: Number, enum [1, -1], required
*   `createdAt`: Date
*   Unique index on `(user, targetId, targetType)` to prevent duplicate votes.

## Design Decisions

*   **RESTful API Design:** Adhering to REST principles for clear, stateless communication.
*   **Modular Structure:** Separation of concerns (routes, controllers, models, middleware, utils) for maintainability and scalability.
*   **JWT Authentication:** Secure and stateless authentication for API endpoints.
*   **Mongoose ODM:** Simplifies MongoDB interactions and provides schema validation.
*   **Centralized Error Handling:** A single middleware to catch and format all API errors consistently.
*   **Input Validation:** Using `express-validator` to ensure data integrity and provide meaningful error messages.
*   **Pagination and Filtering:** Implemented as query parameters for flexible data retrieval.
*   **Nested Comments:** Handled by referencing `parentComment` in the Comment schema.
*   **Vote System:** Unique votes per user per target, with ability to change/remove votes. Vote counts are denormalized on Post/Comment models for efficient retrieval.
*   **Swagger/OpenAPI:** For comprehensive and interactive API documentation.

## Future Enhancements (Bonus Features)

The following features are planned for future iterations:

*   **Rate Limiting:** Implement `express-rate-limit` to protect against brute-force attacks and abuse.
*   **Soft Delete:** Add an `isDeleted` flag to Post and Comment models instead of permanent deletion.
*   **Tagging/Categorization:** Allow posts to be tagged for better organization and searchability.
*   **Admin Endpoints:** Develop specific routes for administrative tasks like content moderation.
*   **Search Functionality:** Implement full-text search capabilities for posts and comments.
*   **Unit and Integration Tests:** Write comprehensive tests to ensure API reliability and prevent regressions.