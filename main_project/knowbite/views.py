from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from .forms import FileUploadForm
from .models import UploadedFile
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.contrib import messages
#import fitz # PyMuPDF for PDF handling
# Create your views here.

def landing_page(request):
    return render(request, 'knowbite/landing_page.html')

@login_required
def dashboard(request):
    # Only show files belonging to the current user, most recent first
    files = UploadedFile.objects.filter(user=request.user).order_by('-uploaded_at')
    context = {
        'title': 'Dashboard',
        'files': files
    }
    return render(request, 'knowbite/dashboard.html', context)

@login_required
def upload_file(request):
    if request.method == 'POST':
        file_type = request.POST.get('file_type')
        youtube_link = request.POST.get('youtube_link', '').strip()

        # Get user's subscription
        try:
            user_subscription = request.user.usersubscription
        except:
            messages.error(request, "You need an active subscription to upload files")
            return redirect('pricing')

        # Handle YouTube links separately
        if file_type == 'youtube':
            if not youtube_link:
                messages.error(request, "YouTube URL is required")
                return redirect('dashboard')
            
            # --- NEW: Use TranscriptAPI instead of yt-dlp ---
            import requests
            import os
            
            try:
                # 1. Setup API Request
                API_KEY = os.getenv('API_KEY', 'sk_x_pq215sTsEweVptvuLwXWaQfSSQsosPvhKJOHreUsg')
                url = 'https://transcriptapi.com/api/v2/youtube/transcript'
                params = {'video_url': youtube_link, 'format': 'json'}
                
                # 2. Call API
                # This gets Title, Duration, AND Transcript in one go (fast!)
                response = requests.get(
                    url, 
                    params=params, 
                    headers={'Authorization': 'Bearer ' + API_KEY}, 
                    timeout=30
                )
                response.raise_for_status()
                data = response.json()
                
                # 3. Extract Metadata
                title = data.get('metadata', {}).get('title', 'Untitled Video')
                transcript_segments = data.get('transcript', [])
                
                # 4. Calculate Duration
                # The API doesn't give total duration directly, so we calculate it:
                # Duration = Start time of last sentence + Duration of last sentence
                if transcript_segments:
                    last_segment = transcript_segments[-1]
                    total_seconds = last_segment.get('start', 0) + last_segment.get('duration', 0)
                    duration_min = total_seconds / 60
                else:
                    duration_min = 0 # Empty video
                
                # Debug print to verify
                print(f"Title: {title}, Duration: {duration_min} mins")

                # 5. Check Subscription Limits
                can_upload, message = user_subscription.can_upload_file('youtube', duration_min=duration_min)
                if not can_upload:
                    messages.error(request, message)
                    return redirect('dashboard')
                
                # 6. Prepare transcript text 
                # (Since we already paid for the API call, let's grab the text now!)
                full_transcript_text = " ".join([t.get('text', '') for t in transcript_segments])

            except Exception as e:
                messages.error(request, f"Error processing YouTube link: {str(e)}")
                return redirect('dashboard')
            
            try:
                uploaded_file = UploadedFile.objects.create(
                    user=request.user,
                    file_type='youtube',
                    youtube_link=youtube_link,
                    file=None,
                    title=title,
                    # If your model has a text field, save it now so you don't have to call the API again!
                    # transcript_text=full_transcript_text 
                )
                messages.success(request, "YouTube link saved successfully")
                return redirect('summary', file_id=uploaded_file.id)
            except Exception as e:
                messages.error(request, f"Error saving YouTube link: {str(e)}")
                return redirect('dashboard')

        # Handle file uploads (PDF/Audio) - No changes made below here
        form = FileUploadForm(request.POST, request.FILES)
        if form.is_valid():
            uploaded_file = form.save(commit=False)
            uploaded_file.user = request.user
            
            # Validate file type consistency
            if uploaded_file.file_type == 'youtube':
                messages.error(request, "Invalid file type selection")
                return redirect('dashboard')
                
            # Check file size and other limits
            file_size_mb = uploaded_file.file.size / (1024 * 1024)  # Convert to MB
            
            # For PDFs, get page count
            pages = None            
            if uploaded_file.file_type == 'pdf':
                try:
                    # Get the file content as bytes
                    file_content = uploaded_file.file.read()
                    
                    import io
                    import pdfplumber
                    with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                        pages = len(pdf.pages)
                        print(f"PDF pages: {pages}")
                    # Reset file pointer for later use
                    uploaded_file.file.seek(0)
                except Exception as e:
                    print(f"Error counting PDF pages: {str(e)}")
                    pages = None
            
            # For audio, get duration
            duration_min = None
            if uploaded_file.file_type == 'audio':
                try:
                    import mutagen
                    audio = mutagen.File(uploaded_file.file)
                    if audio:
                        duration_min = audio.info.length / 60  # Convert seconds to minutes
                        print(duration_min)
                except:
                    duration_min = None
            
            # Check limits based on file type
            can_upload, message = user_subscription.can_upload_file(
                uploaded_file.file_type,
                file_size_mb=file_size_mb,
                duration_min=duration_min,
                pages=pages
            )
            
            if not can_upload:
                messages.error(request, message)
                return redirect('dashboard')
                
            uploaded_file.save()
            messages.success(request, "File uploaded successfully")
            return redirect('summary', file_id=uploaded_file.id)
        else:
            # Improved error messaging
            errors = "\n".join([f"{field}: {','.join(errors)}" for field, errors in form.errors.items()])
            messages.error(request, f"Upload failed:\n{errors}")
    
    return render(request, 'knowbite/dashboard.html')


@login_required
def yournotes(request, file_id=None):
    files = UploadedFile.objects.filter(user=request.user).order_by('-uploaded_at')
    one_file = None
    if file_id:
        one_file = get_object_or_404(UploadedFile, id=file_id, user=request.user)

    if request.method == 'POST':
        one_file.delete()
        return redirect('yournotes')

    context = {
        'title': 'Yournotes',
        'files': files,
        'one_file': one_file
    }
    return render(request, 'knowbite/yournotes.html', context)

@login_required
def settings(request):
    user_plan = request.user.usersubscription
    context = {
        'title': 'Settings',
        'user_plan': user_plan
    }
    return render(request, 'knowbite/settings.html', context)