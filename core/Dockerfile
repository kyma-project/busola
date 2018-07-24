### Main image ###
FROM nginx:stable-alpine

### Copy the dist and nginx config into nginx ###
COPY ./dist /usr/share/nginx/html/
COPY ./nginx/conf.d /etc/nginx/conf.d/
COPY ./nginx/nginx.conf /etc/nginx/
COPY ./nginx/mime.types /etc/nginx/

### Expose ports ###
EXPOSE 80

LABEL source git@github.com:kyma-project/console.git

### Default command to run app ###
CMD ["nginx", "-g", "daemon off;"]
