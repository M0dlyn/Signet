# Signet: Secure Distributed Auction System

Signet is a demonstration of a secure, distributed auction system built with **Spring Boot (Microservices)**, **React**, and **Cryptography**. It showcases the use of **Digital Signatures (RSA-PSS)** to ensure the non-repudiation and integrity of bids in a distributed environment.

## 🚀 Features

*   **Microservices Architecture**:
    *   **Sentinel**: API Gateway & Identity Provider (Spring Boot Web).
    *   **Gavel**: High-performance Auction Engine (Spring Boot gRPC).
*   **Security & Cryptography**:
    *   **RSA-PSS Signatures**: All bids are signed by the client's private key (Web Crypto API) and verified by the server.
    *   **JWT Authentication**: Secure stateless authentication.
    *   **BCrypt**: Password hashing.
*   **Data Integrity**:
    *   **Optimistic Locking**: Handles concurrent bids safely.
    *   **PostgreSQL**: Robust relational database storage.
*   **Modern Frontend**:
    *   **React + Vite**: Fast, modern UI.
    *   **Tailwind CSS v4**: Sleek, responsive design.

## 🛠️ Technology Stack

*   **Frontend**: React, Vite, Tailwind CSS, Web Crypto API.
*   **Backend**: Java 17+, Spring Boot 3.2.0.
*   **Communication**: REST (Client -> Sentinel), gRPC (Sentinel -> Gavel).
*   **Database**: PostgreSQL (Dockerized).
*   **Build Tools**: Maven, npm.

## 📦 Project Structure

```
Signet/
├── client/       # React Frontend
├── sentinel/     # API Gateway & Auth Service
├── gavel/        # Auction Engine (gRPC)
├── proto/        # Shared Protobuf Definitions
└── docker-compose.yml # Database Infrastructure
```

## 🏁 Getting Started

### Prerequisites
*   Java 17+
*   Node.js & npm
*   Docker & Docker Compose
*   Maven

### 1. Start Databases
```bash
docker-compose up -d
```

### 2. Build & Run Backend Services

**Terminal 1: Gavel (Auction Engine)**
```bash
cd gavel
mvn spring-boot:run
```
*Runs on port 9090 (gRPC)*

**Terminal 2: Sentinel (API Gateway)**
```bash
cd sentinel
mvn spring-boot:run
```
*Runs on port 8080 (REST)*

### 3. Run Frontend

**Terminal 3: Client**
```bash
cd client
npm install
npm run dev
```
*Runs on http://localhost:5173*

## 🧪 Verification Flow

1.  **Register**: Go to `/register`. Create an account. This generates an RSA-PSS KeyPair in your browser and sends the Public Key to the server.
2.  **Login**: Go to `/login`. Authenticate to receive a JWT.
3.  **Bid**: Go to `/auction`.
    *   The UI fetches the current price of the "Antique Vase".
    *   Enter a bid amount higher than the current price.
    *   Click **Place Signed Bid**.
    *   **What happens?**
        1.  Browser signs `auctionId:amount:timestamp` with your Private Key.
        2.  Sends Payload + Signature to Sentinel.
        3.  Sentinel fetches your Public Key and verifies the signature.
        4.  If valid, Sentinel forwards the bid to Gavel via gRPC.
        5.  Gavel checks the price and updates the auction (thread-safe).
        6.  Success message returned.

## 📜 License
This project is for educational purposes.