# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json into the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the frontend code into the container
COPY . .

# Build the React application
# RUN npm run build

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Start the application in development mode for now
CMD ["npm", "start"]
