FROM nginx:alpine

COPY src/ /usr/share/nginx/html/
COPY config/ /usr/share/nginx/html/config/
COPY images/ /usr/share/nginx/html/images/

EXPOSE 80
