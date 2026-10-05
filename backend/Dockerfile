FROM node:20-alpine

# Install git
RUN apk add --no-cache git

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application source
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
