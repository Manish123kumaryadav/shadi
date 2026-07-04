import bcrypt from 'bcryptjs';
import { Role, User, Profile, Photo } from './models/index.js';

const seedProfiles = [
  ['Priya Sharma', 'priya@example.com', '9000000001', 'female', 'male', '1999-02-10', 'Mumbai, India', 'Hindu', 'Brahmin', 'MBA', 'Software Engineer', '5\'6"', 'Passionate about technology and travel. Looking for someone who values family and personal growth.', ['Travel', 'Cooking', 'Reading', 'Yoga'], 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&w=400'],
  ['Anjali Verma', 'anjali@example.com', '9000000002', 'female', 'male', '2001-04-21', 'Delhi, India', 'Hindu', 'Jain', 'B.Tech', 'Data Analyst', '5\'4"', 'Friendly and outgoing. Love exploring new places and trying new cuisines.', ['Photography', 'Hiking', 'Cooking', 'Movies'], 'https://images.unsplash.com/photo-1501196354995-147f12f381ca?ixlib=rb-4.0.3&w=400'],
  ['Neha Gupta', 'neha@example.com', '9000000003', 'female', 'male', '1997-09-12', 'Bangalore, India', 'Hindu', 'Baniya', 'M.Tech', 'Product Manager', '5\'7"', 'Ambitious professional with a passion for innovation. Seeking a partner with similar values.', ['Startups', 'Travel', 'Fitness', 'Music'], 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=400'],
  ['Megha Singh', 'megha@example.com', '9000000007', 'female', 'male', '2000-07-08', 'Pune, India', 'Sikh', 'Sikh', 'B.Sc', 'Graphic Designer', '5\'5"', 'Creative and family-oriented. I enjoy art, design, and meaningful conversations.', ['Art', 'Design', 'Gardening', 'Cooking'], 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&w=400'],
  ['Kavya Iyer', 'kavya@example.com', '9000000008', 'female', 'male', '1998-12-19', 'Chennai, India', 'Hindu', 'Iyer', 'M.Sc', 'Research Scientist', '5\'6"', 'Science enthusiast looking for intellectual companionship and shared values.', ['Science', 'Reading', 'Astronomy', 'Hiking'], 'https://images.unsplash.com/photo-1519699047748-de8e457f4568?ixlib=rb-4.0.3&w=400'],
  ['Isha Kapoor', 'isha@example.com', '9000000009', 'female', 'male', '2002-03-04', 'Ahmedabad, India', 'Hindu', 'Marwari', 'B.Com', 'Accountant', '5\'3"', 'Cheerful and family-oriented with traditional values and modern thinking.', ['Family Time', 'Cooking', 'Shopping', 'Movies'], 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&w=400'],
  ['Ritika Jain', 'ritika@example.com', '9000000010', 'female', 'male', '1999-10-23', 'Jaipur, India', 'Jain', 'Jain', 'MBA', 'Marketing Manager', '5\'4"', 'Warm, ambitious, and grounded. I value honesty, family, and growth.', ['Marketing', 'Travel', 'Music', 'Yoga'], 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&w=400'],
  ['Sneha Nair', 'sneha@example.com', '9000000011', 'female', 'male', '1996-06-15', 'Kochi, India', 'Hindu', 'Nair', 'MCA', 'UI Developer', '5\'5"', 'Calm and curious. I enjoy building products, beaches, and good food.', ['Coding', 'Beaches', 'Food', 'Books'], 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-4.0.3&w=400'],
  ['Aditi Rao', 'aditi@example.com', '9000000012', 'female', 'male', '1997-08-29', 'Hyderabad, India', 'Hindu', 'Rao', 'B.Tech', 'Cloud Engineer', '5\'7"', 'Practical, optimistic, and close to family. Looking for a thoughtful partner.', ['Cloud', 'Dance', 'Travel', 'Fitness'], 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&w=400'],
  ['Pooja Mehta', 'pooja@example.com', '9000000013', 'female', 'male', '2000-01-30', 'Surat, India', 'Hindu', 'Vaishnav', 'BBA', 'HR Executive', '5\'4"', 'Easygoing and sincere. I believe in kindness, respect, and shared dreams.', ['People', 'Cooking', 'Movies', 'Travel'], 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?ixlib=rb-4.0.3&w=400'],
  ['Raj Patel', 'raj@example.com', '9000000004', 'male', 'female', '1997-01-15', 'Mumbai, India', 'Hindu', 'Patel', 'B.Tech', 'Software Engineer', '5\'10"', 'Tech enthusiast with passion for innovation. Looking for someone who shares my values.', ['Technology', 'Sports', 'Travel', 'Gaming'], 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&w=400'],
  ['Arjun Kumar', 'arjun@example.com', '9000000005', 'male', 'female', '1999-05-18', 'Delhi, India', 'Hindu', 'Kshatriya', 'MBA', 'Management Consultant', '6\'0"', 'Ambitious professional with love for sports and outdoor activities.', ['Cricket', 'Fitness', 'Travel', 'Reading'], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=400'],
  ['Vikram Singh', 'vikram@example.com', '9000000006', 'male', 'female', '1995-11-03', 'Bangalore, India', 'Hindu', 'Rajput', 'M.Tech', 'DevOps Engineer', '5\'11"', 'Dedicated professional seeking a serious relationship. Family values matter to me.', ['Coding', 'Movies', 'Meditation', 'Cooking'], 'https://images.unsplash.com/photo-1519085360771-9852ead29b63?ixlib=rb-4.0.3&w=400'],
  ['Aditya Reddy', 'aditya@example.com', '9000000014', 'male', 'female', '2000-09-17', 'Hyderabad, India', 'Hindu', 'Reddy', 'B.Tech', 'Business Analyst', '5\'9"', 'Friendly and outgoing. I love sports, music, and spending time with family.', ['Cricket', 'Badminton', 'Music', 'Travel'], 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&w=400'],
  ['Rohan Mishra', 'rohan@example.com', '9000000015', 'male', 'female', '1996-04-11', 'Pune, India', 'Hindu', 'Brahmin', 'M.Sc', 'Data Scientist', '5\'10"', 'Curious and thoughtful. I enjoy learning, trekking, and meaningful relationships.', ['Science', 'Astronomy', 'Trekking', 'Reading'], 'https://images.unsplash.com/photo-1500645745-7cf5b9dbab5e?ixlib=rb-4.0.3&w=400'],
  ['Nikhil Joshi', 'nikhil@example.com', '9000000016', 'male', 'female', '1998-02-26', 'Ahmedabad, India', 'Hindu', 'Jain', 'B.Com', 'Entrepreneur', '5\'8"', 'Business-minded and positive. I like challenges, fitness, and family life.', ['Business', 'Fitness', 'Cooking', 'Traveling'], 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&w=400'],
  ['Karan Malhotra', 'karan@example.com', '9000000017', 'male', 'female', '1995-12-05', 'Chandigarh, India', 'Hindu', 'Punjabi', 'MBA', 'Sales Manager', '6\'1"', 'Energetic, honest, and family-first. Looking for a genuine life partner.', ['Sales', 'Gym', 'Music', 'Road Trips'], 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-4.0.3&w=400'],
  ['Sameer Khan', 'sameer@example.com', '9000000018', 'male', 'female', '1997-07-21', 'Lucknow, India', 'Muslim', 'Sunni', 'B.Arch', 'Architect', '5\'11"', 'Creative professional who values respect, balance, and family bonds.', ['Architecture', 'Sketching', 'Food', 'Travel'], 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&w=400'],
  ['Manav Shah', 'manav@example.com', '9000000019', 'male', 'female', '1999-03-13', 'Surat, India', 'Jain', 'Jain', 'CA', 'Chartered Accountant', '5\'9"', 'Disciplined, caring, and optimistic. I enjoy finance, movies, and family time.', ['Finance', 'Movies', 'Cycling', 'Reading'], 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?ixlib=rb-4.0.3&w=400'],
  ['Dev Sharma', 'dev@example.com', '9000000020', 'male', 'female', '1996-11-28', 'Gurgaon, India', 'Hindu', 'Brahmin', 'B.Tech', 'Product Designer', '5\'10"', 'Design-minded and calm. Looking for a partner with warmth and ambition.', ['Design', 'Startups', 'Coffee', 'Travel'], 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-4.0.3&w=400'],
];

export async function seedDatabase() {
  const passwordHash = await bcrypt.hash('password123', 10);

  await Role.bulkCreate([
    { id: 1, name: 'admin' },
    { id: 2, name: 'user' },
  ], {
    updateOnDuplicate: ['name'],
  });

  for (const item of seedProfiles) {
    const [
      fullName,
      email,
      mobile,
      gender,
      lookingFor,
      dob,
      location,
      religion,
      caste,
      education,
      occupation,
      height,
      bio,
      interests,
      photoUrl,
    ] = item;

    const [user] = await User.findOrCreate({
      where: { email },
      defaults: {
        fullName,
        mobile,
        passwordHash,
        gender,
        lookingFor,
        dob,
        verified: true,
        roleId: email === 'priya@example.com' ? 1 : 2,
      },
    });

    await user.update({
      fullName,
      mobile,
      gender,
      lookingFor,
      dob,
      verified: true,
      roleId: email === 'priya@example.com' ? 1 : 2,
    });

    const [profile] = await Profile.findOrCreate({
      where: { userId: user.id },
      defaults: {
        location,
        religion,
        caste,
        education,
        occupation,
        height,
        bio,
        interests,
      },
    });

    await profile.update({
      userId: user.id,
      location,
      religion,
      caste,
      education,
      occupation,
      height,
      bio,
      interests,
    });

    const primaryPhoto = await Photo.findOne({
      where: { profileId: profile.id, isPrimary: true },
    });

    if (primaryPhoto) {
      await primaryPhoto.update({ url: photoUrl });
    } else {
      await Photo.create({ profileId: profile.id, url: photoUrl, isPrimary: true });
    }
  }
}
