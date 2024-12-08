import locationHistoriesService from '../services/locationHistoriesService';
import loggerHelpers from '../helpers/loggerHelpers';
import { recordStartTime } from '../utils/loggerFormat';

import * as ApiErrors from '../errors';

export default {


    createLocation: (req, res, next) => {
        try {
            const userId = req.auth.userId;

            const { location, dateCreated } = req.body;

            const param = { userId, location, dateCreated };

            locationHistoriesService
                .createLocation(param)
                .then(data => {
                    res.status(200).json({
                        success: true,
                        message: 'Location history created successfully',
                        data: data
                    });
                })
                .catch(error => {
                    // console.error("Error in handleRequestFrienddddddddd:", error);
                    next(error);
                });
        } catch (error) {
            next(error);
        }
    }
}