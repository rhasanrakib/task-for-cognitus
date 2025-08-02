# Use Node.js 20 Alpine as base image
FROM node:20-alpine

WORKDIR /app
COPY .env.example ./.env
COPY package*.json ./
COPY tsconfig.json ./

RUN npm install


COPY src/ ./src/


RUN npm run build   



EXPOSE 3002


CMD ["npm", "start"]
