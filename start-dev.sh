#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🚀 Starting RecipeNest - Full Stack Application${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

# verify Node/npm
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js and npm are required but not found.${NC}"
    echo -e "${YELLOW}Please install Node.js (https://nodejs.org/) and rerun this script.${NC}"
    exit 1
fi

# ensure .env files exist
if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}📝 Creating frontend/.env...${NC}"
    cat > frontend/.env << 'EOF'
VITE_API_BASE_URL=http://localhost:5001
EOF
    echo -e "${GREEN}✅ Created frontend/.env${NC}"
fi

if [ ! -f "backend-v2/.env" ]; then
    echo -e "${YELLOW}📝 Creating backend-v2/.env...${NC}"
    cat > backend-v2/.env << 'EOF'
PORT=5001
CONNECTION_STRING=your_mongodb_connection_string_here
ACCESS_TOKEN_SECERT=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
MEALDB_BASE=https://www.themealdb.com/api/json/v1/1
EOF
    echo -e "${GREEN}✅ Created backend-v2/.env${NC}"
fi

# Function to check if port is in use (optional)
check_port() {
    if command -v lsof >/dev/null 2>&1; then
        if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            return 0  # Port is in use
        else
            return 1  # Port is free
        fi
    else
        # If lsof not available, assume port is free
        return 1
    fi
}

# Note: Using MongoDB Atlas, no local MongoDB check needed
echo -e "${YELLOW}📊 Database: MongoDB Atlas${NC}"
echo -e "${GREEN}✅ Using cloud MongoDB (Atlas)${NC}"

# Check if ports are available (optional)
echo ""
echo -e "${YELLOW}🔍 Checking ports...${NC}"
if check_port 5001; then
    echo -e "${RED}⚠️  Port 5001 appears to be in use. Stop it first:${NC}"
    echo -e "   pkill -f 'node.*server.js'"
    echo -e "${YELLOW}   Continuing anyway...${NC}"
    sleep 2
fi
if check_port 5173; then
    echo -e "${RED}⚠️  Port 5173 appears to be in use. Stop it first:${NC}"
    echo -e "   pkill -f 'vite'"
    echo -e "${YELLOW}   Continuing anyway...${NC}"
    sleep 2
fi
echo -e "${GREEN}✅ Ready to start services${NC}"

# Check if node_modules exist
echo ""
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
if [ ! -d "backend-v2/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend-v2
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    cd ..
fi
echo -e "${GREEN}✅ Dependencies ready${NC}"

# (Removed bootstrap step)

# Start backend
echo ""
echo -e "${BLUE}🔧 Starting Backend Server...${NC}"
cd backend-v2
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
cd ..

# Wait a bit for backend to start
sleep 2

# Start frontend
echo ""
echo -e "${BLUE}🎨 Starting Frontend Server...${NC}"
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
cd ..

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 RecipeNest is running!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}📍 Access URLs:${NC}"
echo -e "   Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "   Backend:  ${BLUE}http://localhost:5001${NC}"
echo -e "   Database: ${BLUE}MongoDB Atlas${NC}"
echo ""
echo -e "${YELLOW}📋 Process IDs:${NC}"
echo -e "   Backend:  ${GREEN}$BACKEND_PID${NC}"
echo -e "   Frontend: ${GREEN}$FRONTEND_PID${NC}"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo -e "   Backend:  ${BLUE}backend.log${NC}"
echo -e "   Frontend: ${BLUE}frontend.log${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait

