# Use official Node.js base image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package.json and yarn.lock first (to leverage Docker caching)
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of your app source code
COPY . .

# Expose the default Expo Web port
EXPOSE 19006

# Start Expo in web mode (without opening a browser)
CMD ["yarn", "expo", "start", "--web", "--non-interactive"]
