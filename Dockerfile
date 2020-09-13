FROM node:12-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 80

CMD [ "node", "app" ]
#CMD [ "npm", "run", "start" ]
