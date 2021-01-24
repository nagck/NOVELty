module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define('Review', {
      content: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 600],
        },
      },
      rate: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    });

    Review.associate = (models) => {
        // We're saying that a Review should belong to a User
        // A Review can't be created without a User due to the foreign key constraint
        models.Review.belongsTo(models.Users, {
            foreignKey: {
              allowNull: false,
            },
        });
        models.Review.belongsTo(models.Books, {
            foreignKey: {
                allowNull: false,
            },
        });
    };
    
    return Review;
};
  