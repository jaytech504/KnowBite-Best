#!/usr/bin/env bash

#Exit on error
set -o errexit

#Install dependencies
pip install -r requirements.txt

#Run migrations
python manage.py migrate

#Collect static files
python manage.py collectstatic --noinput

# Create superuser using custom command
python manage.py create_admin

# Create a directory for ffmpeg
mkdir -p ffmpeg_bin

# Download a static build of ffmpeg (works on Linux)
wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz

# Extract it
tar -xf ffmpeg-release-amd64-static.tar.xz -C ffmpeg_bin --strip-components=1

# Clean up the zip file
rm ffmpeg-release-amd64-static.tar.xz

# Add to PATH so yt-dlp can find it
export PATH=$PATH:$PWD/ffmpeg_bin