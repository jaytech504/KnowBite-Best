# Knowbite - Django Web Application

A powerful web application for uploading and analyzing PDF files, audio files, and YouTube videos. The system automatically extracts text, generates summaries, creates transcripts, produces quizzes, and provides an AI chatbot for each document.

## Features

- **Multi-format Upload**: Support for PDF, Audio (MP3, WAV, etc.), and YouTube links
- **Automatic Text Extraction**: PDF text extraction and audio/video transcription
- **AI-Powered Summaries**: Generate comprehensive summaries using Google Gemini AI
- **Quiz Generation**: Automatically create multiple-choice, true/false, and short-answer quizzes
- **AI Chatbot**: Ask questions about your documents with context-aware responses
- **Modern UI**: Clean, responsive dashboard with three-panel workspace layout
- **User Management**: Secure authentication with login/registration

## Technology Stack

- **Backend**: Django 4.2
- **Database**: PostgreSQL (via Supabase)
- **AI Models**: Google Gemini Pro
- **Transcription Services**: AssemblyAI (audio), YouTube Transcript API (video)
- **PDF Processing**: pdfplumber
- **Frontend**: Django Templates with custom CSS

## Prerequisites

- Python 3.8+
- PostgreSQL (or Supabase PostgreSQL)
- API Keys for:
  - Google Gemini API
  - AssemblyAI API
  - YouTube (for transcript extraction)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables

Edit the `.env` file with your configuration:

```env
# Django Settings
SECRET_KEY=your-secret-key-change-in-production
DEBUG=True

# Database Configuration (Supabase PostgreSQL)
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=your-supabase-host.supabase.co
DB_PORT=5432

# API Keys
GEMINI_API_KEY=your-gemini-api-key
ASSEMBLYAI_API_KEY=your-assemblyai-api-key
```

### 5. Set Up Database

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser (Admin Account)

```bash
python manage.py createsuperuser
```

### 7. Run Development Server

```bash
python manage.py runserver
```

Visit `http://localhost:8000` in your browser.

## Configuration

### Getting API Keys

#### Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy to `GEMINI_API_KEY` in `.env`

#### AssemblyAI
1. Sign up at [AssemblyAI](https://www.assemblyai.com/)
2. Get your API key from the dashboard
3. Copy to `ASSEMBLYAI_API_KEY` in `.env`

#### YouTube Transcript API
- No key required for basic usage (open-source library)

### Database Configuration

For local PostgreSQL:
```env
DB_HOST=localhost
DB_PORT=5432
```

For Supabase:
1. Create a Supabase project
2. Get connection details from Settings > Database
3. Update `.env` with your connection info

## Project Structure

```
project/
├── config/                 # Django settings and URLs
│   ├── settings.py        # Main settings
│   ├── urls.py           # URL routing
│   └── wsgi.py           # WSGI configuration
├── documents/             # Main application
│   ├── models.py         # Database models
│   ├── views.py          # View logic
│   ├── forms.py          # Django forms
│   ├── urls.py           # App URLs
│   ├── utils.py          # Processing utilities
│   └── admin.py          # Admin interface
├── templates/             # HTML templates
│   ├── base.html         # Base template
│   └── documents/        # App-specific templates
│       ├── login.html
│       ├── register.html
│       ├── dashboard.html
│       └── workspace.html
├── media/                # User uploads
├── manage.py            # Django CLI
├── requirements.txt     # Python dependencies
└── .env                # Environment configuration
```

## Application Features

### Dashboard
- Left sidebar with navigation
- Three upload cards (PDF, Audio, YouTube)
- List of uploaded documents
- Quick access to document workspace

### File Workspace
- **Left Mini Sidebar**: Navigation between features
  - Summary
  - Transcript (audio/YouTube only)
  - Quiz
  - Chatbot

- **Central Content Area**: Displays selected feature
  - Summary with formatted text
  - Transcript with scrollable content
  - Interactive quiz with multiple question types
  - Chatbot view

- **Right Chat Panel**: Always-visible chatbot
  - Message history
  - Input box for questions
  - Context-aware responses based on document content

### Features Detail

#### Summary
- AI-generated comprehensive summary
- Well-formatted with sections and bullet points
- Regenerate option

#### Transcript
- Full transcript for audio/YouTube files
- Clean, readable formatting
- Scrollable content

#### Quiz
- Multiple-choice questions
- True/False questions
- Short-answer questions
- Submit and show answers functionality

#### Chatbot
- Ask questions about the document
- Responses based only on document content
- Last 10 messages per document
- Context-aware AI responses

## Usage

### Upload a Document

1. Go to Dashboard
2. Click on one of the upload cards:
   - **PDF**: Click to select a PDF file
   - **Audio**: Click to select an audio file
   - **YouTube**: Paste a YouTube URL and press Enter
3. Wait for processing to complete
4. Click "Open" to view the workspace

### Interact with Document

1. In the workspace, use the left sidebar to navigate features
2. View summary, transcript, or quiz in the central area
3. Ask questions using the chatbot panel on the right
4. Messages are saved automatically

### Settings
- User profile management (coming soon)
- Notification preferences (coming soon)

## Admin Interface

Access Django admin at `/admin` with your superuser credentials to:
- Manage users and permissions
- View all documents and their processing status
- Monitor chat messages
- Edit summaries, transcripts, and quizzes

## Deployment

### Production Setup

1. Set `DEBUG=False` in `.env`
2. Generate a secure `SECRET_KEY`
3. Configure allowed hosts
4. Set up HTTPS

### Using Gunicorn

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

### Docker Deployment

```dockerfile
FROM python:3.10
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
RUN python manage.py collectstatic --noinput
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

## Troubleshooting

### API Key Issues
- Verify keys are correctly set in `.env`
- Check API quotas and rate limits
- Test keys in respective dashboards

### Database Connection
- Verify PostgreSQL is running
- Check connection details in `.env`
- Ensure database user has proper permissions

### Processing Failures
- Check API keys are valid
- Verify file formats are supported
- Check server logs for detailed errors
- Ensure sufficient API quota

### Chat Not Working
- Verify Gemini API key is active
- Check document has extracted text
- Ensure chat messages are being saved

## Performance Optimization

- Cache frequent summaries
- Implement async task processing for large files
- Optimize database queries with indexes
- Enable gzip compression

## Security

- Use strong `SECRET_KEY` in production
- Enable HTTPS
- Implement rate limiting
- Sanitize user inputs
- Use environment variables for secrets
- Enable CSRF protection (default)

## Contributing

1. Create feature branches
2. Write tests for new features
3. Follow Django best practices
4. Submit pull requests with descriptions

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Check the troubleshooting section
- Review Django documentation
- Check API provider documentation
- Submit issues on GitHub

## Future Enhancements

- [ ] Real-time file processing with WebSockets
- [ ] Batch processing multiple files
- [ ] Export documents as PDF
- [ ] Custom quiz settings
- [ ] User preferences and themes
- [ ] Advanced search functionality
- [ ] Document sharing and collaboration
- [ ] Integration with cloud storage (Google Drive, Dropbox)
- [ ] Mobile app
- [ ] Advanced analytics

## Performance Notes

- Large PDFs may take longer to process
- Transcription times depend on audio duration
- Quiz generation uses AI tokens (monitor usage)
- Chat responses depend on API latency
