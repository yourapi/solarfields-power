### STAGE 1: Build ###
FROM node:8.11-alpine as builder

COPY package*.json ./

RUN npm set progress=false && npm config set depth 0 && npm cache clean --force

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm i
RUN mkdir /web
RUN cp -R ./node_modules ./web

WORKDIR /web

COPY . .

RUN $(npm bin)/ng build --prod --build-optimizer

### STAGE 2: Setup ###

FROM nginx:1.13.8-alpine

COPY deployment/nginx.conf /etc/nginx/nginx.conf
COPY deployment/hosting.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /web/dist/solarfields-power /usr/share/nginx/html/

RUN touch /var/run/nginx.pid && \
  chown -R nginx:nginx /var/run/nginx.pid && \
  chown -R nginx:nginx /var/cache/nginx && \
  chown -R nginx:nginx /usr/share/nginx/html
