const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Visitor extends Model { }

    Visitor.init({
        ip: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        visitedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        sequelize,
        modelName: 'Visitor',
        timestamps: true, 
    }
    );

    return Visitor;
};
