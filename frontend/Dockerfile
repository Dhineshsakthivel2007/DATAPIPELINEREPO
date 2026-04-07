FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy your frontend files to the Nginx html directory
# Note: Ensure these paths are relative to where you run 'docker-compose build'
COPY frontend/index.html /usr/share/nginx/html/index.html
COPY frontend/style.css /usr/share/nginx/html/style.css
COPY frontend/weather.js /usr/share/nginx/html/weather.js

# Set permissions so Nginx can read the files
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]