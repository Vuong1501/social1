import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
import number from '../utils/joi/lib/types/number';

// mobile, userGroupsId, address,  status, dateUpdated, dateCreated, dateExpire
const DEFAULT_SCHEMA = {
    dateCreated: ValidateJoi.createSchemaProp({
        string: noArguments,
        label: viMessage['api.locationHistories.dateCreated'],
        allow: null
    }),
    location: ValidateJoi.createSchemaProp({
        array: noArguments,
        label: viMessage['api.locationHistories.location'],
        items: ValidateJoi.createSchemaProp({
            string: noArguments,
            required: true,
            min: 1,
            regex: /^[^\s].*[^\s]$/,
        }),
        min: 1,
        max: 10,
        required: true
    }),
};

export default {
    authenCreate: (req, res, next) => {
        console.log('validate authenCreate');

        const { location, dateCreated } = req.body;
        // console.log("dateCreated", dateCreated);
        // console.log("location", location);

        const input = { location, dateCreated };

        const SCHEMA = Object.assign(
            ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
                dateCreated: {
                    regex: /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
                    allow: null
                },
                location: {
                    required: true
                }

            }),
        );

        console.log('input: ', input);
        ValidateJoi.validate(input, SCHEMA)
            .then(data => {

                if (!data.dateCreated) {
                    data.dateCreated = new Date().toISOString().split('T')[0];
                } else {
                    const inputDate = new Date(data.dateCreated);
                    const now = new Date();

                    if (inputDate > now) {
                        throw new Error('Ngày giờ tạo không hợp lệ: không được là ngày trong tương lai.');
                    }
                }
                res.locals.body = data;
                next();
            })
            .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
    },



};
