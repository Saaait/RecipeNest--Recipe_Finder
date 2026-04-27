#!/bin/bash

# RecipeNest - Setup Script
# Creates environment files and installs dependencies

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🔧 RecipeNest - Initial Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

# Check Node.js
echo -e "${YELLOW}📦 Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found!${NC}"
    echo "  Install from: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm: $(npm --version)${NC}"

# Create frontend .env file
echo ""
echo -e "${YELLOW}📝 Creating frontend/.env...${NC}"
if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓ frontend/.env already exists${NC}"
else
    cat > frontend/.env << 'EOF'
VITE_API_BASE_URL=http://localhost:5001
EOF
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
fi

# Create backend .env file
echo -e "${YELLOW}📝 Creating backend-v2/.env...${NC}"
if [ -f "backend-v2/.env" ]; then
    echo -e "${GREEN}✓ backend-v2/.env already exists${NC}"
else
    cat > backend-v2/.env << 'EOF'
# Port
PORT=5001

# MongoDB Connection String
CONNECTION_STRING=your_mongodb_connection_string_here

# JWT Secret Key
ACCESS_TOKEN_SECERT=your_jwt_secret

# TheMealDB API Base URL
MEALDB_BASE=https://www.themealdb.com/api/json/v1/1
EOF
    echo -e "${GREEN}✓ Created backend-v2/.env${NC}"
fi

# Install backend dependencies
echo ""
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd backend-v2
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
cd ..

# Install frontend dependencies
echo ""
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
cd ..

echo ""
echo -e "${YELLOW}📊 Checking MongoDB...${NC}"
if ! systemctl is-active --quiet mongod 2>/dev/null; then
    echo -e "${YELLOW}⚠ MongoDB is not running${NC}"
    echo "  Start with: sudo systemctl start mongod"
    echo "  Enable on boot: sudo systemctl enable mongod"
else
    echo -e "${GREEN}✓ MongoDB is running${NC}"
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Make sure MongoDB is running: sudo systemctl start mongod"
echo "  2. Run the application: ./start-dev.sh"
echo ""
