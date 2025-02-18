# Use the official Node.js image from Docker Hub
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json /app/

# Install the dependencies
RUN npm install

# Copy the rest of your React app code
COPY . /app/

# Build the React app
RUN npm run build

# Use Nginx to serve the built app
FROM nginx:alpine

# Copy the build folder to Nginx's public folder
COPY --from=0 /app/build /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
