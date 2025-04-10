#!/bin/bash

# Print colorful messages
print_blue() {
    echo -e "\e[34m$1\e[0m"
}

print_green() {
    echo -e "\e[32m$1\e[0m"
}

print_yellow() {
    echo -e "\e[33m$1\e[0m"
}

print_red() {
    echo -e "\e[31m$1\e[0m"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_yellow "Creating .env file with placeholder values..."
    cat > .env << EOF
# Replace with your actual values
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
EOF
    print_green ".env file created. Please edit it with your actual values."
    print_yellow "Press any key to continue or Ctrl+C to exit and edit first..."
    read -n 1
else
    print_blue ".env file already exists."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_red "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_blue "Building and starting CircleMatch services..."
docker-compose up -d --build

# Check if services are running
if [ $? -eq 0 ]; then
    print_green "Services are starting up. Use the following commands to check status:"
    echo "  docker-compose ps      - List services"
    echo "  docker-compose logs -f - Follow logs"
    echo ""
    print_green "Your application will be available at:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:8000"
else
    print_red "There was an error starting the services. Please check the logs with 'docker-compose logs'."
fi