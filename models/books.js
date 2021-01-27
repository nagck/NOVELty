// Creating Books model
module.exports = (sequelize, DataTypes) => {
    const Books = sequelize.define('Books', {
    //   bookID: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    //     primaryKey: true,
    //     autoIncrement: true
    //   },  
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 240],
        },
      },
      ISBN: {
        type: DataTypes.STRING,
        //allowNull: false,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 140],
        }
      },
      URL: {
        type: DataTypes.STRING,
        allowNull: true,
      },

    });
  
    // Books.associate = (models) => {
    //   // Associating Books with Review
    //   // When a Book is deleted, also delete any associated Review

    //   models.Books.hasMany(models.Reviews, models.Readings, {

    //     onDelete: 'cascade',
    //     //foreignKey: 'userID'
    //   });
    // };
  
    return Books;
  };
  