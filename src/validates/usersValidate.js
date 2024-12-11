import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const DEFAULT_SCHEMA = {
  name: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.fullname'],
    allow: null
  }),
  username: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.username'],
    allow: null
  }),
  password: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.password'],
    allow: null
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.users.dateCreated']
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.users.dateUpdated']
  }),
};

export default {
  authenCreate: (req, res, next) => {
    console.log('validate authenCreate');

    const {
      name,
      username,
      password,
    } = req.body;

    const user = {
      name,
      username,
      password,
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        name: {
          max: 100
        },
        username: {
          regex: /\w/i,
          max: 50,
          required: true
        },
        password: {
          min: 6,
          max: 100
        },
      })
    );
    // console.log('input: ', input);
    ValidateJoi.validate(user, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    console.log('validate authenUpdate');

    const {
      name,
    } = req.body;

    const user = {
      name,
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        name: {
          regex: /\w/i,
          max: 100
        },
      })
    );

    ValidateJoi.validate(user, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  // authenUpdate_status: (req, res, next) => {
  //   // console.log("validate authenCreate")
  //   // const userCreatorsId = req.auth.userId || 0;

  //   const { status, dateUpdated } = req.body;
  //   const userGroup = { status, dateUpdated };

  //   const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
  //     status: {
  //       required: noArguments
  //     }
  //     // dateUpdated: {
  //     //   required: noArguments
  //     // }
  //   });

  //   ValidateJoi.validate(userGroup, SCHEMA)
  //     .then(data => {
  //       res.locals.body = data;
  //       next();
  //     })
  //     .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  // },
  // authenFilter: (req, res, next) => {
  //   console.log('validate authenFilter');
  //   const { filter, sort, range, attributes } = req.query;

  //   res.locals.sort = parseSort(sort);
  //   res.locals.range = range ? JSON.parse(range) : [0, 49];
  //   res.locals.attributes = attributes;
  //   if (filter) {
  //     const {
  //       id,
  //       username,
  //       image,
  //       password,
  //       fullname,
  //       email,
  //       mobile,
  //       userGroupsId,
  //       address,

  //       status,
  //       dateExpire,
  //       FromDate,
  //       ToDate
  //     } = JSON.parse(filter);

  //     const user = {
  //       id,
  //       username,
  //       image,
  //       password,
  //       fullname,
  //       email,
  //       mobile,
  //       userGroupsId,
  //       address,

  //       status,
  //       dateExpire,
  //       FromDate,
  //       ToDate
  //     };

  //     console.log(user);
  //     const SCHEMA = {
  //       ...DEFAULT_SCHEMA,
  //       id: ValidateJoi.createSchemaProp({
  //         string: noArguments,
  //         label: viMessage['api.users.id'],
  //         regex: regexPattern.listIds
  //       }),

  //       userGroupsId: ValidateJoi.createSchemaProp({
  //         string: noArguments,
  //         label: viMessage.userGroupsId,
  //         regex: regexPattern.listIds
  //       }),
  //       FromDate: ValidateJoi.createSchemaProp({
  //         date: noArguments,
  //         label: viMessage.FromDate
  //       }),
  //       ToDate: ValidateJoi.createSchemaProp({
  //         date: noArguments,
  //         label: viMessage.ToDate
  //       })
  //     };

  //     // console.log('input: ', input);
  //     ValidateJoi.validate(user, SCHEMA)
  //       .then(data => {
  //         if (id) {
  //           ValidateJoi.transStringToArray(data, 'id');
  //         }
  //         if (userGroupsId) {
  //           ValidateJoi.transStringToArray(data, 'userGroupsId');
  //         }

  //         res.locals.filter = data;
  //         console.log('locals.filter', res.locals.filter);
  //         next();
  //       })
  //       .catch(error => {
  //         next({ ...error, message: 'Định dạng gửi đi không đúng' });
  //       });
  //   } else {
  //     res.locals.filter = {};
  //     next();
  //   }
  // },
  // authenRequestForgetPass: (req, res, next) => {
  //   console.log('validate authenUpdate');

  //   const { email, mobile } = req.body;
  //   const user = { email, mobile };

  //   const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
  //     email: {
  //       regex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i,
  //       max: 200
  //     },
  //     mobile: {
  //       regex: /^[0-9]+$/i,
  //       max: 15
  //     }
  //   });

  //   ValidateJoi.validate(user, SCHEMA)
  //     .then(data => {
  //       res.locals.body = data;
  //       next();
  //     })
  //     .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  // }
  // Hàm gọi tất cả các phương thức validate
  // validateAll: (req, res, next) => {
  //   this.authenCreate(req, res, (err) => {
  //     if (err) return next(err);
  //     this.authenUpdate(req, res, (err) => {
  //       if (err) return next(err);
  //     });
  //   });
  // }
};
