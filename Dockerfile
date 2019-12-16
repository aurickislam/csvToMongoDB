FROM node:12.13.1

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 80

CMD [ "node", "app.js" ]
#CMD [ "npm", "run", "start" ]
