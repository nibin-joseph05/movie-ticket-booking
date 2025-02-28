# Use Node.js as base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all other files
COPY . .

# Expose the React default port
EXPOSE 3000

# Start the React app
CMD ["npm", "start"]
