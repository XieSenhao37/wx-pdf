'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class userdata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  userdata.init({
    openid: DataTypes.STRING,
    nickname: DataTypes.STRING,
    start_time: DataTypes.STRING,
    quit_time: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'userdata',
  });
  return userdata;
};