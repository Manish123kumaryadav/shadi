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

## Premium Tables SQL

Run this in your MySQL database if premium tables are not created automatically in production.

Note: These table names match the current Sequelize models: `PremiumPlans`, `Subscriptions`, and `Payments`. If your existing DB uses lowercase table names, rename them consistently in these queries and in the app config/model table names.

```sql
CREATE TABLE IF NOT EXISTS `PremiumPlans` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) NULL,
  `priceInr` INT NOT NULL DEFAULT 0,
  `durationDays` INT NOT NULL DEFAULT 30,
  `features` JSON NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `sortOrder` INT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `premium_plans_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Subscriptions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `status` ENUM('pending', 'active', 'expired', 'cancelled') NOT NULL DEFAULT 'pending',
  `startsAt` DATETIME NULL,
  `endsAt` DATETIME NULL,
  `provider` VARCHAR(255) NULL DEFAULT 'manual',
  `providerOrderId` VARCHAR(255) NULL,
  `providerPaymentId` VARCHAR(255) NULL,
  `userId` INT NULL,
  `planId` INT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `subscriptions_user_id_idx` (`userId`),
  KEY `subscriptions_plan_id_idx` (`planId`),
  KEY `subscriptions_status_ends_at_idx` (`status`, `endsAt`),
  CONSTRAINT `subscriptions_user_fk`
    FOREIGN KEY (`userId`) REFERENCES `Users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `subscriptions_plan_fk`
    FOREIGN KEY (`planId`) REFERENCES `PremiumPlans` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `amountInr` INT NOT NULL,
  `currency` VARCHAR(255) NOT NULL DEFAULT 'INR',
  `status` ENUM('created', 'paid', 'failed') NOT NULL DEFAULT 'created',
  `provider` VARCHAR(255) NOT NULL DEFAULT 'manual',
  `providerOrderId` VARCHAR(255) NULL,
  `providerPaymentId` VARCHAR(255) NULL,
  `providerSignature` VARCHAR(255) NULL,
  `metadata` JSON NULL,
  `userId` INT NULL,
  `planId` INT NULL,
  `subscriptionId` INT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `payments_user_id_idx` (`userId`),
  KEY `payments_plan_id_idx` (`planId`),
  KEY `payments_subscription_id_idx` (`subscriptionId`),
  KEY `payments_provider_order_id_idx` (`providerOrderId`),
  CONSTRAINT `payments_user_fk`
    FOREIGN KEY (`userId`) REFERENCES `Users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `payments_plan_fk`
    FOREIGN KEY (`planId`) REFERENCES `PremiumPlans` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `payments_subscription_fk`
    FOREIGN KEY (`subscriptionId`) REFERENCES `Subscriptions` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Seed default premium plan:

```sql
INSERT INTO `PremiumPlans`
  (`key`, `name`, `description`, `priceInr`, `durationDays`, `features`, `isActive`, `sortOrder`, `createdAt`, `updatedAt`)
VALUES
  (
    'premium_monthly',
    'Premium Plan',
    'Unlock advanced discovery and unlimited connection actions.',
    499,
    30,
    JSON_ARRAY('See all likes received', 'See profile visitors', 'Unlimited likes', 'Priority profile visibility'),
    1,
    1,
    NOW(),
    NOW()
  )
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `priceInr` = VALUES(`priceInr`),
  `durationDays` = VALUES(`durationDays`),
  `features` = VALUES(`features`),
  `isActive` = VALUES(`isActive`),
  `sortOrder` = VALUES(`sortOrder`),
  `updatedAt` = NOW();
```

If your existing users table is named `users` instead of `Users`, replace `REFERENCES Users (id)` with `REFERENCES users (id)` before running.

If uploaded profile pictures are not showing, make sure the `Photos.url` column can store long image data URLs:

```sql
ALTER TABLE `Photos`
  MODIFY COLUMN `url` MEDIUMTEXT NOT NULL;
```

If profile open/view count gives a server error, create or fix the profile view table:

```sql
CREATE TABLE IF NOT EXISTS `ProfileViews` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `viewerId` INT NULL,
  `viewedUserId` INT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `profile_views_viewer_viewed_unique` (`viewerId`, `viewedUserId`),
  KEY `profile_views_viewed_user_id_idx` (`viewedUserId`),
  CONSTRAINT `profile_views_viewer_fk`
    FOREIGN KEY (`viewerId`) REFERENCES `Users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `profile_views_viewed_fk`
    FOREIGN KEY (`viewedUserId`) REFERENCES `Users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
