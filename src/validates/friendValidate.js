import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
import number from '../utils/joi/lib/types/number';

// mobile, userGroupsId, address,  status, dateUpdated, dateCreated, dateExpire
const DEFAULT_SCHEMA = {
    userReceiveId: ValidateJoi.createSchemaProp({
        number: noArguments,
        label: viMessage['api.users.id'],
        allow: null
    }),
    status: ValidateJoi.createSchemaProp({
        string: noArguments,
        label: viMessage['api.users.status'],
        allow: null
    })
};

export default {
    authenRequest: (req, res, next) => {
        console.log('validate authenCreate');

        const { userReceiveId } = req.body;

        const friend = { userReceiveId };

        const SCHEMA = Object.assign(
            ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
                userReceiveId: {
                    max: 1000,
                    min: 1,
                    required: true
                }
            })
        );

        // console.log('input: ', input);
        ValidateJoi.validate(friend, SCHEMA)
            .then(data => {
                res.locals.body = data;
                next();
            })
            .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
    },
    authenHandleRequest: (req, res, next) => {
        console.log('validate authenUpdate');

        const { status } = req.body;

        const friend = { status };

        const SCHEMA = Object.assign(
            ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
                status: {
                    valid: ['accept', 'reject'],
                    required: true
                },
            })
        );

        ValidateJoi.validate(friend, SCHEMA)
            .then(data => {
                res.locals.body = data;
                next();
            })
            .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
    },
    authenFilter: (req, res, next) => {

        console.log('validate authenFilter');

        // console.log("iddd", req.auth.userId);

        const { filter, sort, range, attributes } = req.query;
        // const userId = req.auth.userId;
        // console.log("userId", userId);

        // console.log("filter", filter);
        // console.log("sort", sort);
        // console.log("range", range);
        // console.log("attributes", attributes);

        res.locals.sort = parseSort(sort);
        res.locals.range = range ? JSON.parse(range) : [0, 49];
        res.locals.attributes = attributes || null;

        if (filter) {

            // console.log("userId", userId);
            // const userId = req.auth.userId;
            const { name } = JSON.parse(filter);

            const filterData = { name };

            console.log('filterData', filterData);

            const SCHEMA = {
                // ...DEFAULT_SCHEMA,
                // userId: ValidateJoi.createSchemaProp({
                //     number: noArguments,
                //     label: 'User ID',
                //     regex: regexPattern.listIds,
                // }),
                name: ValidateJoi.createSchemaProp({
                    string: noArguments,
                    label: 'Name',
                }),
            };

            // console.log('input: ', input);
            ValidateJoi.validate(filterData, SCHEMA)
                .then(data => {
                    if (data.userId) {
                        ValidateJoi.transStringToArray(data, 'id');
                    }

                    res.locals.filter = data;
                    console.log('locals.filter', res.locals.filter);
                    next();
                })
                .catch(error => {
                    next({ ...error, message: 'Định dạng gửi đi không đúng' });
                });
        } else {
            res.locals.filter = {};
            next();
        }
    },


};
