# Hello_World - Lifetime Financial Planner
CSE 416 Section 1, Scott Stoller - Hello World
Jacky Chen, Vicki Yang, Jack Zhang, Zisang Wu

### Frontend 
To setup -
1. cd frontend
2. npm install

To start - 
1. npm start

To end - CTRL+C / kill terminal

### Backend

#### .env
1. Use .env.example to setup .env

#### Database
To setup - 
1. Download MongoDB Community Edition from offical site - https://www.mongodb.com/try/download/community
2. During installation, select "Install MongoDB as a Service"
3. Add MongoDB to System PATH -> Open PowerShell as Administrator and run:
    [System.Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\MongoDB\Server\X.Y\bin", [System.EnvironmentVariableTarget]::Machine)
        Where X.Y is replaced with your installed version, e.g., 7.0

To start - 
1. Open PowerShell as Administrator and run:
    net start MongoDB

To end - End task in task manager ("MongoDB Database Server")

#### Scraping Backend (Ignore Library warnings, it uses the libraries stored in the Virtual Environment )
To setup - 
1. cd backend
2. python -m venv venv
3.  Windows     - venv\Scripts\Activate
    Mac/Linux   - source venv/bin/activate
3. pip install numpy pandas scipy beautifulsoup4 flask flask-cors requests pymongo dotenv

To run webscrape - 
1. Open Command Prompt (cmd)
2. curl -X POST http://localhost:5000/api/webscrape -H "Content-Type: application/json" -d "{}"


To run rmdscrape - 
1. Open Command Prompt (cmd)
2. curl -X POST http://localhost:5000/api/rmdscrape -H "Content-Type: application/json" -d "{}"

#### Typescript Backend
To setup -
1. cd backend
2. npm install

To start - 
1. npm run dev

To end - CTRL+C / kill terminal