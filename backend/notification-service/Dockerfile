FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache ca-certificates
RUN npm install --omit=dev

COPY . .

EXPOSE 5005

CMD ["node", "src/server.js"]
