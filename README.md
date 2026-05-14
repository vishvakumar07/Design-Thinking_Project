# Intelligent Mobile Safety Companion for Mine Workers

This project is an AI-powered full-stack application designed to improve safety for mine workers by monitoring environmental conditions, detecting hazards using Machine Learning, and sending real-time alerts.

## Project Structure
\`\`\`
mine-safety-ai/
│
├── client/          (React Frontend - Vite, TailwindCSS, ChartJS, Socket.io-client)
├── server/          (Node.js Backend - Express, MongoDB, Socket.io)
├── ai-engine/       (Python AI Engine - FastAPI, Scikit-learn Isolation Forest)
└── data/            (Dataset generation output directory)
\`\`\`

## Tech Stack
- **Frontend**: React.js, TailwindCSS, Chart.js, React Router, Socket.io-client, Lucide React
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io
- **AI/ML**: Python, FastAPI, Scikit-learn (Isolation Forest Anomaly Detection)
- **Database**: MongoDB

## Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB (Running locally on default port `27017` or configured via `.env`)

## Installation & Setup Instructions

### 1. Backend Server (Node.js)
1. Navigate to the `server` directory: \`cd server\`
2. Install dependencies: \`npm install\`
3. Create a `.env` file (already included with defaults if you just cloned):
   \`\`\`env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/mine-safety-ai
   AI_ENGINE_URL=http://localhost:8000
   \`\`\`
4. Start the server: \`npm start\`
   *The server runs on http://localhost:5000*

### 2. AI Engine (Python)
1. Navigate to the `ai-engine` directory: \`cd ai-engine\`
2. Create standard virtual environment: \`python -m venv venv\`
3. Activate virtual environment:
   - Windows: \`.\\venv\\Scripts\\activate\`
   - Mac/Linux: \`source venv/bin/activate\`
4. Install dependencies: \`pip install -r requirements.txt\`
5. Start the FastAPI AI Prediction Server: \`python main.py\`
   *The AI server runs on http://localhost:8000*

### 3. Frontend Application (React)
1. Navigate to the `client` directory: \`cd client\`
2. Install dependencies: \`npm install\`
3. Start the Vite development server: \`npm run dev\`
   *The frontend runs usually on http://localhost:5173*

### 4. Simulating IoT Sensor Data
To populate the dashboard with real-time data and trigger the AI anomaly detection:
1. Ensure the **Backend (Node.js)** and **AI Engine (Python)** are both running.
2. In a new terminal, navigate to the `ai-engine` directory and activate the virtual environment.
3. Run the generator script: \`python generate_data.py\`
   *This script will generate random sensor data every 3 seconds, ask the AI Engine for anomaly predictions, broadcast the result to the Node backend via REST, and append the logs to `data/simulated_sensor_data.csv`.*

## User Roles & Navigation
1. **Worker Dashboard**: Open the frontend app and select "Worker", enter a name, and login. You will see your real-time stats and an Emergency SOS button.
2. **Supervisor Dashboard**: Open the frontend app and select "Supervisor". You will see a command center mapping all active workers, live system health, and an alert feed. You can also view historical analytics and resolved alerts through the navigation links.

## System Features
- **AI Hazard Detection**: Uses Scikit-learn's Isolation Forest model to detect subtle anomalies across gas, temperature, humidity, and heart rate parameters before they hit critical rule-based thresholds.
- **Real-Time Communication**: Socket.io enables instant propagation of sensor changes and emergency SOS broadcasts across all active dashboards.
- **Beautiful UI**: TailwindCSS and Lucide-react ensure a dark-mode optimized, premium aesthetic appropriate for an emergency command center.
