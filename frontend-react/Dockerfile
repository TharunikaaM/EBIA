# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the remaining application code
COPY . .

# Expose the Vite development server port
EXPOSE 5173

# Run the Vite dev server
# In a true deployment, this would be a build + serve step (e.g. nginx)
CMD ["npm", "run", "dev", "--", "--host"]
