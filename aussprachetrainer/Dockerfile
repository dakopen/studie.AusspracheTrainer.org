# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt
#RUN pip install --no-cache-dir -r requirements.txt

# Install FFmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Expose port for Gunicorn
EXPOSE 8000

# Create a group and user
RUN addgroup --gid 1000 myusergroup && \
    adduser --uid 1000 --disabled-password --gecos '' --ingroup myusergroup myuser

# Change ownership of the working directory
RUN chown -R myuser:myusergroup /usr/src/app
USER myuser

# Start Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "aussprachetrainer.wsgi:application"]
