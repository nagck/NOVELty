module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define('Users', {
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
  
    Users.associate = (models) => {
      // Associating Users with Reading Books and Review
      // When a User is deleted, also delete any associated Reading Books, Review
      models.Users.hasMany(models.Reading, models.Review, {
        onDelete: 'cascade',
        //foreignKey: 'bookID'
      });
    };
  
    return Users;
  };
  