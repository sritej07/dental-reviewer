# Oral Health Screening Application

A comprehensive full-stack MERN application for oral health screening that enables patients to upload dental photos for professional review and receive detailed PDF reports.

## Features

### Authentication & Authorization
- JWT-based authentication with HTTP-only cookies
- Role-based access control (Patient/Admin)
- Secure registration and login system

### Patient Features
- Upload dental photos with patient information
- View submission status and history
- Download comprehensive PDF reports
- Track screening progress through dashboard

### Admin Features
- Review all patient submissions
- Interactive annotation canvas with multiple tools:
  - Rectangles, circles, arrows
  - Freehand drawing
  - Notes and markings
- Generate professional PDF reports
- Dashboard with statistics and analytics

### Technical Features
- Cloudinary integration for image and PDF storage
- Canvas-based annotation system
- PDF generation matching demo layout
- Responsive design for all devices
- Real-time status updates
- Secure file upload handling

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Cloudinary** - File storage
- **PDFKit** - PDF generation
- **Multer** - File upload handling
- **Fabric.js** - Canvas manipulation

### Frontend
- **React** - UI library
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Fabric.js** - Annotation canvas
- **React Dropzone** - File upload UI
- **Lucide React** - Icons

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account

### Backend Setup

1. Install backend dependencies:
```bash
npm run install-server
```

2. Configure environment variables:
Create a `.env` file in the root directory with:
```
MONGODB_URI=mongodb://localhost:27017/oral-health-screening
JWT_SECRET=your-super-secret-jwt-key
CLOUDINARY_URL=cloudinary://181114942987694:NZSvjpi3O1Z1g8lkjbcvEFbsqWE@dykdcyi2s
CLOUDINARY_CLOUD_NAME=dykdcyi2s
CLOUDINARY_API_KEY=181114942987694
CLOUDINARY_API_SECRET=NZSvjpi3O1Z1g8lkjbcvEFbsqWE
PORT=5000
NODE_ENV=development
```

### Frontend Setup

1. Install frontend dependencies:
```bash
npm run install-client
```

2. The React app will connect to the backend via proxy configuration.

### Database Setup

MongoDB will automatically create the required collections when the application starts. No manual schema setup is needed.

## Running the Application

### Development Mode
```bash
# Run both frontend and backend concurrently
npm run dev

# Or run separately:
npm run server  # Backend only
npm run client  # Frontend only
```

### Production Mode
```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

The application will be available at:
- Frontend: http://localhost:3000 (development)
- Backend API: http://localhost:5000

## Usage

### For Patients

1. **Register/Login**: Create an account or sign in
2. **Upload Photos**: Navigate to upload page and submit dental photos
3. **Track Progress**: Monitor submission status in dashboard
4. **Download Reports**: Access completed reports from dashboard

### For Admins

1. **Login**: Sign in with admin credentials
2. **Review Submissions**: View all patient submissions
3. **Annotate Images**: Use annotation tools to mark areas of interest
4. **Generate Reports**: Create PDF reports with recommendations
5. **Track Statistics**: Monitor overall system usage

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Submissions
- `POST /api/submissions` - Create new submission
- `GET /api/submissions/my-submissions` - Get user submissions
- `GET /api/submissions/:id` - Get single submission

### Admin
- `GET /api/admin/submissions` - Get all submissions (admin)
- `PUT /api/admin/submissions/:id/annotations` - Save annotations
- `POST /api/admin/submissions/:id/generate-report` - Generate PDF report
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

## Demo Credentials

For testing purposes, you can create accounts or use these demo credentials:

- **Patient**: patient@demo.com / password123
- **Admin**: admin@demo.com / password123

## Security Features

- Password hashing with bcrypt
- JWT tokens with HTTP-only cookies
- Role-based access control
- Input validation and sanitization
- File type and size restrictions
- CORS configuration
- Environment variable protection

## Deployment

The application is configured for deployment on platforms like Heroku, Vercel, or similar:

1. Set environment variables in your deployment platform
2. Ensure MongoDB connection string is configured
3. Set NODE_ENV to 'production'
4. Build and deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For support or questions, please contact the development team or create an issue in the repository.