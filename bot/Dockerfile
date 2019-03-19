FROM node:carbon

# Setup app working directory
WORKDIR /usr/app/bot

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install typescript -g
RUN npm install

# Copy sourcecodew
COPY . .

# Build post copy
RUN npm run build

EXPOSE 3978

# Start app
CMD [ "npm", "start" ]
