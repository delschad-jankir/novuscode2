# Use the official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port 8080 for the application
EXPOSE 8080

# Set the port environment variable
ENV PORT=8080

# Start the Next.js application
CMD ["npm", "start"]
