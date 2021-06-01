FROM node:14
WORKDIR /usr/src/app
RUN chown node:node /usr/src/app
USER node
COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . .
ENTRYPOINT ["npx", "nodemon", "--inspect=0.0.0.0", "bin/www"]