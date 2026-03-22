# Stage 1: Build the React app
FROM node:20-slim as build-stage
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Serve the app with a lightweight server
FROM node:20-slim
WORKDIR /app
RUN npm install -g serve
COPY --from=build-stage /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
