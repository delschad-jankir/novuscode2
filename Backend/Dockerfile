# Use the official Node.js image from the Docker Hub
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code (including server.js) into the container
COPY . .

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run your application
CMD ["node", "server.js"]
