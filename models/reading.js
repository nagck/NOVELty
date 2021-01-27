// Creating reading model
module.exports = (sequelize, DataTypes) => {
    const Readings = sequelize.define('Readings', {
      // readID: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      //   primaryKey: true,
      //   autoIncrement: true
      // },
      reading: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      favourite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
    });
  
    Readings.associate = (models) => {
      // We're saying that Reading should belong to a User
      // A Reading can't be created without a user and book due to the foreign key constraints
      models.Readings.belongsTo(models.Users, {
        foreignKey: {
          allowNull: false,
        },
      });
      models.Readings.belongsTo(models.Books, {
          foreignKey: {
            allowNull: false,
          },
      });
    };
  
    return Readings;
};
  