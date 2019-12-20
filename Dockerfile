FROM node:12.14.0
#FROM node:13.5.0

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 80

CMD [ "node", "app.js" ]
#CMD [ "npm", "run", "start" ]
