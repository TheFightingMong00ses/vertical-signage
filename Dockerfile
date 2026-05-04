FROM nginx:alpine

COPY src/ /usr/share/nginx/html/
COPY config/ /usr/share/nginx/html/config/

EXPOSE 80
