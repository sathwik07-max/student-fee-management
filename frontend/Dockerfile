# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Copy the package files from the frontend folder
COPY frontend/package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the frontend code into the container
COPY frontend/ .

# Make port 3000 available
EXPOSE 3000

# Start the application in development mode for now
CMD ["npm", "start"]
