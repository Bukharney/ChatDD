# ChatDD Backend

This is the backend service for the ChatDD application, rewritten in Go.

## Prerequisites

Ensure you have the following installed:

- [Go](https://golang.org/) (version 1.18 or higher)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Bukharney/ChatDD.git
   cd ChatDD/backend
   ```

2. Install dependencies:
   ```bash
   go mod tidy
   ```

## Running the Project

1. Start the development server:

   ```bash
   air -c .air.toml
   ```

2. The server will start on `http://localhost:8080` by default.

## Environment Variables

Create a `.env` file in the `backend` directory and configure the following variables:

```
DATABASE_URL=your-database-url
JWT_SECRET=your-secret-key-64-characters-long
```

## Running the Chat Client

1. Navigate to the `backend/server/ws/client` directory:

   ```bash
   cd backend/server/ws/client
   ```

2. Create user accounts using http requests:

   ```bash
   curl -X POST http://localhost:8080/api/v1/users\
   -H "Content-Type: application/json" \
   -d '{"username": <username>, "email": <email>, "password": <password>}'
   ```

   Replace `<username>`, `<email>`, and `<password>` with the desired values.

3. Run the client:

   ```bash
   go run client.go <username> <password> <recipient>
   ```

   Replace `<username>`, `<password>`, and `<recipient>` with the desired values.

## License

This project is licensed under the [MIT License](LICENSE).
