FROM node:carbon

# Setup app working directory
WORKDIR /usr/app/bot

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install typescript -g
RUN npm install
RUN npm run build

# Copy sourcecodew
COPY . .

EXPOSE 3978

# Start app
CMD [ "npm", "start" ]
