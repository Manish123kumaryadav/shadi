# 🎀 ShadiMatch - Quick Start Guide

## ✅ Your Matrimony Website is LIVE!

Congratulations! Your complete ShadiMatch matrimony website is built, tested, and running! 🎉

---

## 🚀 Getting Started

### 1. **Start the Development Server**

Open PowerShell or Terminal and run:

```powershell
cd "c:\Users\kumar\OneDrive\Desktop\shadiproject"
npm run dev
```

The server will start at **http://localhost:5174/** (or next available port if 5173 is busy)

### 2. **Open in Browser**

Visit: **http://localhost:5174/**

---

## 👤 Test the Full Flow

### Register a New Account
1. Click **"Register"** in navbar
2. Fill in the form:
   - Full Name: `Priya Singh`
   - Email: `priya@example.com`
   - Password: `SecurePassword123`
   - Confirm Password: `SecurePassword123`
   - Looking for: Female
   - DOB: 1997-03-15
   - Religion: Hindu
3. Check the Terms & Conditions checkbox
4. Click **"Create Account"**

### Login
1. Click **"Login"** or use registered credentials
2. Email: `priya@example.com`
3. Password: `SecurePassword123`
4. Click **"Sign In"**

### Explore Features
1. **Browse Profiles**: Swipe through profiles, like/pass/message
2. **Messages**: Chat with matched users
3. **My Profile**: View and edit your profile
4. **Likes & Views**: See who liked you

---

## 📁 Project Structure

```
shadiproject/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation component
│   │   └── ProfileCard.jsx     # Profile display card
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   ├── Register.jsx        # Registration page
│   │   ├── Login.jsx           # Login page
│   │   ├── Browse.jsx          # Profile browsing
│   │   ├── Messages.jsx        # Messaging interface
│   │   ├── Profile.jsx         # User profile
│   │   └── Likes.jsx           # Likes & views
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── data/
│   │   └── mockProfiles.js     # Mock profile data
│   ├── App.jsx                 # Main App with routing
│   ├── index.css               # Global styles
│   └── main.jsx                # Entry point
├── package.json                # Dependencies
└── vite.config.js              # Vite configuration
```

---

## 🎨 Features Included

### Authentication
- ✅ User registration with validation
- ✅ Login with mock authentication
- ✅ Session persistence (localStorage)
- ✅ Protected routes for authenticated users

### Profile Browsing
- ✅ Swipeable profile cards
- ✅ Profile filtering (age, location, religion)
- ✅ Like/Pass/Message actions
- ✅ Profile information display (bio, interests, badges)

### Messaging
- ✅ Conversation management
- ✅ Real-time message display
- ✅ Message input and sending
- ✅ Unread message badges

### Profile Management
- ✅ View user profile
- ✅ Edit profile information
- ✅ Photo management
- ✅ Account settings

### Connections
- ✅ View likes received
- ✅ View profile views
- ✅ Accept/decline matches
- ✅ Quick message access

---

## 🛠️ Available Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install dependencies (if needed)
npm install

# Install specific package
npm install package-name
```

---

## 🔧 Backend Integration Steps

### Step 1: Configure API Base URL
Edit `src/services/api.js`:
```javascript
const API_BASE_URL = 'https://your-api-endpoint.com/api';
```

### Step 2: Replace Mock Data
Modify service methods in `src/services/api.js` to make real API calls:
```javascript
// Example: Login service
export const loginUser = (email, password) => {
  return axios.post('/auth/login', { email, password });
};
```

### Step 3: Update Mock Profiles
Replace `mockProfiles.js` data with real API responses

### Step 4: Implement Real Messaging
- Consider WebSocket for real-time messaging
- Store messages in database
- Add message read/delivery status

---

## 💾 Database Fields Needed

### Users Table
```
- id (primary key)
- full_name
- email
- password (hashed)
- age
- height
- education
- occupation
- religion
- caste
- mother_tongue
- location
- bio
- interests (JSON array)
- photos (JSON array with URLs)
- created_at
- updated_at
```

### Profiles Table
```
- id (primary key)
- user_id (foreign key)
- verified (boolean)
- online_status
- last_seen
```

### Likes Table
```
- id (primary key)
- from_user_id
- to_user_id
- created_at
```

### Messages Table
```
- id (primary key)
- from_user_id
- to_user_id
- message_text
- created_at
- read_at
```

---

## 🔐 Environment Variables

Create `.env` file in root directory:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=5000
```

Access in code:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

---

## 📦 Dependencies Installed

- **react**: 18.2.0+ - UI library
- **react-router-dom**: 6.x - Routing
- **axios**: 1.x - HTTP client
- **lucide-react**: Latest - Icons
- **vite**: 8.x - Build tool

---

## 🎯 Common Tasks

### Add a New Route
1. Create new page in `src/pages/`
2. Import in `src/App.jsx`
3. Add route in Routes component:
```javascript
<Route path="/newpage" element={<NewPage />} />
```

### Add New Profile Fields
1. Update `mockProfiles.js` structure
2. Update Profile form in `Register.jsx`
3. Update ProfileCard display in `ProfileCard.jsx`
4. Update API service method in `services/api.js`

### Modify Styles
- Global: `src/App.css` and `src/index.css`
- Component-specific: `src/pages/PageName.css`
- Color variables in `src/index.css`

---

## 🚨 Troubleshooting

### Dev server won't start
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
npm run dev
```

### Port 5173 already in use
- Vite automatically tries next port (5174, 5175, etc.)
- Check the terminal output for the correct URL

### Images not loading
- Verify Unsplash URLs are accessible
- Consider using local images in `public/` folder

### localStorage issues
- Clear browser cache/cookies
- Check browser's localStorage settings
- Verify data structure matches expected format

---

## 📚 Resources

- [React Documentation](https://react.dev)
- [React Router Guide](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)
- [Axios Documentation](https://axios-http.com)
- [Lucide React Icons](https://lucide.dev)

---

## 🎓 Learning Tips

1. **Understand the Component Flow**:
   - App.jsx → Routes → Page Components → Sub-components

2. **Follow the Styling Pattern**:
   - Global styles in App.css
   - Page-specific styles in corresponding CSS files

3. **API Service Pattern**:
   - All API calls centralized in services/api.js
   - Easy to switch between mock and real data

4. **State Management**:
   - Component-level state with useState
   - Session persistence with localStorage
   - Consider Redux/Context API for complex state

---

## 💡 Enhancement Ideas

1. **Social Features**
   - User reviews/ratings
   - Success stories showcase
   - Referral system

2. **Advanced Matching**
   - AI-based compatibility scoring
   - Advanced filters (hobbies, lifestyle)
   - Match recommendations

3. **Premium Features**
   - Unlimited likes/messages
   - Profile boost
   - See who viewed your profile
   - Incognito mode

4. **Communication**
   - Video call integration
   - Voice messages
   - Live notifications

5. **Safety Features**
   - ID verification
   - Profile verification badges
   - Safety tips section
   - Report user functionality

---

## 🎉 You're All Set!

Your matrimony website is ready for:
- ✅ Testing and validation
- ✅ Backend integration
- ✅ Feature additions
- ✅ Deployment to production

---

**Happy Coding! 💕**

For questions or customization needs, refer to the component files and their inline comments.

**Project Created**: 2024  
**Framework**: React 18 + Vite  
**Status**: Ready for Development
