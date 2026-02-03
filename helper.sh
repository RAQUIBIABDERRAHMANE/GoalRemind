#!/bin/bash

# GoalRemind Helper Script
# This script provides shortcuts for common tasks

echo "🎯 GoalRemind Helper Script"
echo "=========================="
echo ""

# Function to display menu
show_menu() {
    echo "Select an option:"
    echo "1) Install dependencies"
    echo "2) Setup environment (generate keys)"
    echo "3) Setup database"
    echo "4) Run development server"
    echo "5) Build for production"
    echo "6) Start production server"
    echo "7) Generate database migrations"
    echo "8) Open database studio"
    echo "9) Backup database"
    echo "0) Exit"
    echo ""
}

# Function to install dependencies
install_deps() {
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
}

# Function to setup environment
setup_env() {
    echo "🔑 Generating VAPID keys..."
    npx tsx scripts/generate-vapid-keys.ts
    echo ""
    echo "🔐 Generating Job API secret..."
    npx tsx scripts/generate-job-secret.ts
    echo ""
    echo "⚠️  Don't forget to copy these values to your .env.local file!"
}

# Function to setup database
setup_db() {
    echo "🗄️  Setting up database..."
    echo "Generating migrations..."
    npm run db:generate
    echo "Running migrations..."
    npm run db:migrate
    echo "✅ Database setup complete!"
}

# Function to run dev server
run_dev() {
    echo "🚀 Starting development server..."
    npm run dev
}

# Function to build
build_prod() {
    echo "🏗️  Building for production..."
    npm run build
    echo "✅ Build complete!"
}

# Function to start prod
start_prod() {
    echo "🌐 Starting production server..."
    npm start
}

# Function to generate migrations
gen_migrations() {
    echo "📝 Generating database migrations..."
    npm run db:generate
    echo "✅ Migrations generated!"
}

# Function to open studio
open_studio() {
    echo "🎨 Opening Drizzle Studio..."
    npm run db:studio
}

# Function to backup database
backup_db() {
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="./data/goalremind.db.backup_$TIMESTAMP"
    
    if [ -f "./data/goalremind.db" ]; then
        echo "💾 Backing up database..."
        cp ./data/goalremind.db "$BACKUP_FILE"
        echo "✅ Database backed up to: $BACKUP_FILE"
    else
        echo "❌ Database file not found!"
    fi
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice [0-9]: " choice
    echo ""
    
    case $choice in
        1)
            install_deps
            ;;
        2)
            setup_env
            ;;
        3)
            setup_db
            ;;
        4)
            run_dev
            ;;
        5)
            build_prod
            ;;
        6)
            start_prod
            ;;
        7)
            gen_migrations
            ;;
        8)
            open_studio
            ;;
        9)
            backup_db
            ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done
