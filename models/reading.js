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
  