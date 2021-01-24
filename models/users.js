// Requiring bcrypt for password hashing. Using the bcryptjs version as the regular bcrypt module sometimes causes errors on Windows machines
var bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
    let Users = sequelize.define('Users', {
      // userID: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      //   primaryKey: true,
      //   autoIncrement: true
      // },  
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 140],
        },
      },
      password_digest: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [6, 20],
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 140],
        }
      },
    });
  
    // Users.associate = (models) => {
    //   // Associating Users with Reading Books and Review
    //   // When a User is deleted, also delete any associated Reading Books, Review
    //   models.Users.hasMany(models.Reading, models.Review, {
    //     onDelete: 'cascade',
    //     //foreignKey: 'bookID'
    //   });
    // };

   // Creating a custom method for our User model. This will check if an unhashed password entered by the user can be compared to the hashed password stored in our database
   Users.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password_digest);
  };
  // Hooks are automatic methods that run during various phases of the User Model lifecycle
  // In this case, before a User is created, we will automatically hash their password
  Users.addHook("beforeCreate", function(user) {
    user.password_digest = bcrypt.hashSync(user.password_digest, bcrypt.genSaltSync(10), null);
  });
  return Users;
  };
  