import MODELS from '../models/models';
import models from '../entity/index';
import _, { includes } from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import { Op, where } from 'sequelize';
import order from '../locales/vi-Vn/order';

const { users, sequelize, locationHistories } = models;

export default {

    createLocation: async param => {
        const { userId, location, dateCreated } = param;

        // console.log("param", param);

        // lấy ra tất cả bản ghi về location
        const userLocations = await locationHistories.findAll({
            where: { userId: userId },
            order: [['dateCreated', 'ASC']]
        });

        if (userLocations.length >= 10) {
            const oldest = userLocations[0];
            // console.log("oldest", oldest);

            await locationHistories.destroy({
                where: { id: oldest.id }
            })
        };

        // tạo location mới
        const newLocation = await locationHistories.create({
            userId: userId,
            location: location,
            dateCreated: dateCreated
        });

        return newLocation;

    }
}