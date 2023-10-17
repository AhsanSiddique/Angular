ARG project="bulk-registration"
ARG env="dev"
#STAGE1
### STAGE 1: Build ###
FROM node:14.17-alpine AS build
RUN rm -rf /usr/sharex/nginx/html/*

WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG project
ARG env
RUN npm run ${env} ${project}
### STAGE 2: Run ###
FROM nginx:1.17.1-alpine
ARG project
ARG env
COPY apps/${project}/src/conf/ssl/cert-${env}.pem /etc/nginx/cert.pem
COPY apps/${project}/src/conf/ssl/cert-${env}.key /etc/nginx/cert.key
COPY apps/${project}/src/conf/nginx/nginx-${env}.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/apps/${project} /usr/share/nginx/html
USER root
RUN chown -R nginx:nginx  /usr/share/nginx/html

RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chmod -R 766 /var/log/nginx/

RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    chown -R nginx:nginx /var/cache/nginx

USER nginx

EXPOSE 8443

CMD ["nginx", "-g", "daemon off;"]
