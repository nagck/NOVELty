// Requiring bcrypt for password hashing. Using the bcryptjs version as the regular bcrypt module sometimes causes errors on Windows machines
const bcrypt = require("bcryptjs");
// Creating our User model
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
    // Password validation - cannot be null and must between 6-20 characters 
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6,20],
          msg: 'Password must be 6-20 characters!'
        },
      },
    },
    // Email validation - cannot be null, and must be a proper email address
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate:{
        isEmail: {
          args: true,
          msg: 'Must be a valid e-mail!'
        },
        isUnique(value) {
          return Users.findOne({where:{email:value}})
            .then((email) => {
              if (email) {
                throw new Error('Email already taken!');
              }
            })
        }
      }        
    },
  });

  // Creating a custom method for our User model. This will check if an unhashed password entered by the user can be compared to the hashed password stored in our database
  Users.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };
  // Hooks are automatic methods that run during various phases of the User Model lifecycle
  // In this case, before a User is created, we will automatically hash their password
  Users.addHook("beforeCreate", user => {
    user.password = bcrypt.hashSync(
      user.password,
      bcrypt.genSaltSync(10),
      null
    );
  });
  // Users.associate = (models) => {
  //   // Associating Users with Reading Books and Review
  //   // When a User is deleted, also delete any associated Reading Books, Review
  //   models.Users.hasMany(models.Readings, models.Reviews, {
  //     onDelete: 'cascade',
  //   });
  // };
  return Users;
};