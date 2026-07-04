export function calculateAge(dob) {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export function formatProfile(profile) {
  const user = profile.User;
  const primaryPhoto = profile.Photos?.find((photo) => photo.isPrimary) || profile.Photos?.[0];

  return {
    id: profile.id,
    userId: profile.userId,
    name: user?.fullName || 'Member',
    email: user?.email,
    gender: user?.gender,
    lookingFor: user?.lookingFor,
    age: calculateAge(user?.dob),
    location: profile.location || '',
    religion: profile.religion || '',
    caste: profile.caste || '',
    motherTongue: profile.motherTongue || '',
    education: profile.education || '',
    occupation: profile.occupation || '',
    height: profile.height || '',
    image: primaryPhoto?.url || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&w=400',
    photos: profile.Photos?.map((photo) => photo.url) || [],
    bio: profile.bio || '',
    interests: Array.isArray(profile.interests) ? profile.interests : [],
    verified: Boolean(user?.verified),
  };
}

export function inferGenderFromLookingFor(lookingFor) {
  if (lookingFor === 'male') return 'female';
  return 'male';
}
