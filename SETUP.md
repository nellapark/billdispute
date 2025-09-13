# Bill Dispute Assistant Setup

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Anthropic Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Required Services Setup

### 1. Twilio Setup
1. Create a Twilio account at https://www.twilio.com
2. Get your Account SID and Auth Token from the Console
3. Purchase a phone number for making outbound calls
4. Set up webhooks pointing to your application:
   - Status Callback: `https://yourdomain.com/api/webhooks/call-status`
   - Recording Callback: `https://yourdomain.com/api/webhooks/recording-status`

### 2. ElevenLabs Setup
1. Create an ElevenLabs account at https://elevenlabs.io
2. Get your API key from the profile settings
3. Choose a voice ID (default is Bella: EXAVITQu4vr4xnSDxMaL)

### 3. Anthropic Setup
1. Create an Anthropic account at https://console.anthropic.com
2. Get your API key
3. Ensure you have access to Claude 3.5 Sonnet

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create the uploads directory:
```bash
mkdir -p public/uploads
```

3. Run the development server:
```bash
npm run dev
```

## Features

- **Document Upload**: Upload bills in PDF, image, or text format
- **Phone Number Extraction**: Automatically extract customer service numbers
- **AI-Powered Calling**: Use Anthropic's Claude for natural conversations
- **Voice Synthesis**: ElevenLabs for realistic voice generation
- **Call Management**: Twilio for reliable phone calls
- **Real-time Dashboard**: Track dispute status and call history
- **Transcript Recording**: Full conversation logs

## Usage

1. Upload a bill document using the upload interface
2. Add a description of the dispute
3. The system will automatically extract the phone number
4. An AI-powered call will be initiated to dispute the charge
5. Monitor progress in the dashboard
6. Review call transcripts and outcomes

## Development Notes

- The application uses hardcoded mock data for the dashboard
- No database is currently implemented - all data is in-memory
- For production, implement proper data persistence
- Add authentication and user management
- Implement proper error handling and logging
- Add rate limiting for API calls

## Troubleshooting

- Ensure all API keys are correctly set in `.env.local`
- Check Twilio webhook URLs are accessible from the internet
- Verify phone number format is correct (+1XXXXXXXXXX)
- Monitor console logs for detailed error messages
