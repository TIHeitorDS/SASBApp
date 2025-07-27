FROM node:14 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build

FROM httpd:2.4

#copy dist files to the Apache server's document root
COPY --from=builder /app/dist/ /usr/local/apache2/htdocs/

# Expose port 80
EXPOSE 80
