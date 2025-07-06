# CozyRest Web Application

A full-stack web application built with **Laravel 10 (backend)** and **ReactJS 18 (frontend)**. The project demonstrates entity relationships, RESTful API communication, authentication, database migrations, testing, and Docker-based deployment.

---

## 🔧 Technology Stack

- **Backend:** Laravel 10+
- **Frontend:** ReactJS 18
- **API Communication:** RESTful APIs (Laravel API Resources + Axios)
- **Database:** MySQL (with Laravel migrations and seeders)
- **Containerization:** Docker, Docker Compose

---

## 📌 Core Features

### ✅ Authentication

- User registration & login
- API-based authentication using Laravel Sanctum or Passport
- Secure token-based frontend-backend communication

### ✅ Database

- Uses Laravel’s migration system
- All migrations are reversible
- Seeders included for testing with sample data

### ✅ Unit Testing

- Laravel PHP Unit tests for backend
- Focus on achieving 100% test coverage for key functionalities

### ✅ ERD (Entity Relationship Diagram)

- A visual ERD is included under `/CozyRest - ERD.jpg`
- Designed using [Draw.io](https://draw.io) 

### ✅ Docker Support

- Dockerized for local development and easy deployment
- Includes `docker-compose.yml` for quick startup

---

## 🚀 Getting Started

### Prerequisites

- Docker + Docker Compose
- Node.js (if running frontend separately)
- Composer (if running backend separately)

### 1. Clone the Repository

```bash
git clone https://github.com/yona01/CozyRest.git
