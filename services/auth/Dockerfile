FROM node:18-alpine

# RUN apt-get update && apt-get install -y build-essential python

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install
# RUN npm rebuild bcrypt --build-from-source

# Bundle app source
COPY . .

# Expose the port your app runs on
EXPOSE 3001

# Command to run the application
CMD ["node", "server.js"]