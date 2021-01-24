module.exports = (sequelize, DataTypes) => {
    const Reviews = sequelize.define('Reviews', {
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

    Reviews.associate = (models) => {
        // We're saying that a Review should belong to a User
        // A Review can't be created without a User due to the foreign key constraint
        models.Reviews.belongsTo(models.Users, {
            foreignKey: {
              allowNull: false,
            },
        });
        models.Reviews.belongsTo(models.Books, {
            foreignKey: {
                allowNull: false,
            },
        });
    };
    
    return Reviews;
};
  