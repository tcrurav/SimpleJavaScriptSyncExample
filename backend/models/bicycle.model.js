module.exports = (sequelize, Sequelize) => {
  const Bicycle = sequelize.define("bicycle", {
    brand: {
      type: Sequelize.STRING
    },
    model: {
      type: Sequelize.STRING
    },
    stock: {
      type: Sequelize.INTEGER
    },
  });

  return Bicycle;
};