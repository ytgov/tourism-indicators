FROM busybox:latest

# Copy your web app files
COPY . /www

# Expose port 8080
EXPOSE 8080

# Start BusyBox HTTP server
CMD ["httpd", "-f", "-p", "8080", "-h", "/www"]
