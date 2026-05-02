FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache ca-certificates
RUN npm install

COPY . .

EXPOSE 5001

CMD ["npm", "start"]
