FROM node:carbon

# Setup app working directory
WORKDIR /usr/app/menu

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy sourcecode
COPY . .

EXPOSE 3000

# Start app
CMD [ "npm", "start" ]