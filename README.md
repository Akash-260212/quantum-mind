# Quantum Mind (SIH 26140)

An interactive, web-based quantum computing algorithm learning platform with 3D Bloch sphere, real-time circuit simulation, longitudinal misconception telemetry, regional language AI mentor, and IBM Qiskit backend.

## 🚀 Live Web Deployment Instructions

### 1. Frontend Deployment (Vercel - 100% Free)
1. Visit [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Select your GitHub repository: `Akash-260212/quantum-mind`.
3. Keep default build settings (`Vite` framework detected, build command: `npm run build`, output: `dist`).
4. (Optional) Set Environment Variable:
   - `VITE_API_BASE_URL`: Your Render backend URL (e.g. `https://quantum-mind-backend.onrender.com`).
   - If omitted, the frontend automatically runs in zero-latency client WASM mode.
5. Click **Deploy**. In ~45 seconds, you will receive your live public URL: `https://quantum-mind-xxx.vercel.app`.

### 2. Backend Deployment (Render.com - 100% Free)
1. Visit [render.com](https://render.com) and click **"New Web Service"**.
2. Connect your GitHub repository: `Akash-260212/quantum-mind`.
3. Configure the service:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables (optional):
   - `GEMINI_API_KEY`: Your Google Gemini API key (for cloud LLM chat responses).
5. Click **Create Web Service**. Once deployed, copy your Render URL (e.g., `https://quantum-mind-api.onrender.com`) and paste it as `VITE_API_BASE_URL` in Vercel!
