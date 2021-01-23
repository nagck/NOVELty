module.exports = (sequelize, DataTypes) => {
    const Reading = sequelize.define('Reading', {
      // readID: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      //   primaryKey: true,
      //   autoIncrement: true
      // },
      reading: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      favourite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
    });
  
    Reading.associate = (models) => {
      models.Reading.belongsTo(models.Users, {
        foreignKey: {
          allowNull: false,
        },
      });
      models.Reading.belongsTo(models.Books, {
          foreignKey: {
            allowNull: false,
          },
      });
    };
  
    return Reading;
};
  