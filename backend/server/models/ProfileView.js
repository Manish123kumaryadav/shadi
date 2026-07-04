import sequelize from '../config/database.js';

const ProfileView = sequelize.define('ProfileView', {}, {
  indexes: [{ unique: true, fields: ['viewerId', 'viewedUserId'] }],
});

export default ProfileView;
