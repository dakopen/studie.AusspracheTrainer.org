FROM nginx:alpine

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy a new configuration file
COPY nginx.conf /etc/nginx/conf.d

# Expose port 80
EXPOSE 80
