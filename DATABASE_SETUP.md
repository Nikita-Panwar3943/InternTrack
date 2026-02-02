# MongoDB Atlas Database Setup Guide

This guide will help you set up MongoDB Atlas for your Student Internship & Skill Tracker application.

## 🚀 Step-by-Step Setup

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign Up"**
3. Sign up with your email or Google/GitHub account
4. Verify your email address

### 2. Create a New Cluster

1. After logging in, click **"Build a Database"**
2. Select **"M0 Sandbox"** (Free tier - 512MB)
3. Choose a cloud provider and region (closest to your users)
4. Leave cluster name as default or change to `internship-tracker`
5. Click **"Create Cluster"**

### 3. Configure Security Settings

#### Create Database User:
1. Under **"Database Access"**, click **"Add New Database User"**
2. **Username**: `internship-app`
3. **Password**: Generate a strong password (save it securely)
4. **Database User Privileges**: Select **"Read and write to any database"**
5. Click **"Add User"**

#### Configure Network Access:
1. Under **"Network Access"**, click **"Add IP Address"**
2. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Click **"Confirm"**
4. **Note**: For production, restrict to specific IP addresses

### 4. Get Connection String

1. Go to **"Database"** → Click **"Connect"** on your cluster
2. Select **"Drivers"**
3. Copy the connection string
4. Replace `<password>` with your database user password

### 5. Set Up Environment Variables

Create a `.env` file in your `backend/` directory:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://internship-app:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/internship-tracker?retryWrites=true&w=majority

# JWT Secret Key
JWT_SECRET=your_super_secret_jwt_key_make_it_long_and_random

# Server Configuration
PORT=5000
NODE_ENV=development

# Cloudinary Configuration (for file uploads - optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 6. Install Backend Dependencies

```bash
cd backend
npm install
```

### 7. Test Database Connection

```bash
npm run dev
```

You should see:
```
Server is running on port 5000
Connected to MongoDB Atlas
```

## 🗄️ Database Collections

Once connected, MongoDB will automatically create these collections:

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  role: String ('student' | 'admin' | 'recruiter'),
  profile: ObjectId (references StudentProfile or RecruiterProfile),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### StudentProfiles Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (references User),
  firstName: String,
  lastName: String,
  phone: String,
  location: String,
  bio: String,
  avatar: String,
  resume: {
    url: String,
    filename: String,
    uploadedAt: Date
  },
  skills: [{
    name: String,
    proficiency: String ('beginner' | 'intermediate' | 'advanced' | 'expert'),
    score: Number (0-100),
    lastAssessed: Date,
    endorsements: [ObjectId]
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    gpa: Number
  }],
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String
  }],
  stats: {
    applicationsCount: Number,
    shortlistedCount: Number,
    selectedCount: Number,
    skillsAssessedCount: Number
  }
}
```

### Internships Collection
```javascript
{
  _id: ObjectId,
  title: String,
  company: String,
  recruiter: ObjectId (references User),
  description: String,
  requirements: [String],
  responsibilities: [String],
  skills: [String],
  location: String,
  workType: String ('onsite' | 'remote' | 'hybrid'),
  duration: String,
  startDate: Date,
  endDate: Date,
  stipend: String,
  isPaid: Boolean,
  industry: String,
  applicationDeadline: Date,
  openings: Number,
  isActive: Boolean,
  isApproved: Boolean,
  postedAt: Date,
  views: Number,
  applicationsCount: Number
}
```

### Applications Collection
```javascript
{
  _id: ObjectId,
  student: ObjectId (references User),
  internship: ObjectId (references Internship),
  recruiter: ObjectId (references User),
  status: String ('applied' | 'shortlisted' | 'interview' | 'rejected' | 'selected' | 'withdrawn'),
  coverLetter: String,
  resume: {
    url: String,
    filename: String
  },
  appliedAt: Date,
  lastUpdated: Date,
  notes: [{
    author: ObjectId (references User),
    content: String,
    createdAt: Date
  }],
  interviewSchedule: {
    date: Date,
    time: String,
    location: String,
    type: String ('phone' | 'video' | 'onsite'),
    notes: String
  }
}
```

## 🔧 Optional: Seed Initial Data

Create a script to seed initial data:

```javascript
// backend/scripts/seedData.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing data
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = new User({
      username: 'admin',
      email: 'admin@interntrack.com',
      password: adminPassword,
      role: 'admin'
    });
    await admin.save();
    
    // Create sample student
    const studentPassword = await bcrypt.hash('student123', 12);
    const student = new User({
      username: 'student',
      email: 'student@interntrack.com',
      password: studentPassword,
      role: 'student'
    });
    await student.save();
    
    // Create student profile
    const studentProfile = new StudentProfile({
      user: student._id,
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Computer Science student looking for internships',
      skills: [
        { name: 'JavaScript', proficiency: 'intermediate', score: 75 },
        { name: 'React', proficiency: 'intermediate', score: 70 },
        { name: 'Node.js', proficiency: 'beginner', score: 60 }
      ]
    });
    await studentProfile.save();
    
    console.log('Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
```

Run the seed script:
```bash
cd backend
node scripts/seedData.js
```

## 🚨 Common Issues & Solutions

### Connection Issues
- **Error**: `MongoNetworkError`
- **Solution**: Check IP whitelist in Network Access settings

### Authentication Issues
- **Error**: `Authentication failed`
- **Solution**: Verify username and password in connection string

### CORS Issues
- **Error**: CORS policy error
- **Solution**: Ensure FRONTEND_URL matches your frontend URL

## 📊 Monitor Your Database

1. Go to MongoDB Atlas dashboard
2. Click on your cluster
3. View **Metrics** tab for performance monitoring
4. Check **Collections** tab to see your data

## 🔒 Security Best Practices

1. **Never commit .env files to version control**
2. **Use strong, unique passwords**
3. **Restrict IP access in production**
4. **Enable database backups**
5. **Monitor database access logs**

## 🆘 Support

If you encounter issues:
1. Check MongoDB Atlas documentation
2. Verify your connection string format
3. Ensure your user has correct permissions
4. Check network connectivity

Your database is now ready for the Student Internship & Skill Tracker application!
