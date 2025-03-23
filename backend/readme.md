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

## License

This project is licensed under the [MIT License](LICENSE).
