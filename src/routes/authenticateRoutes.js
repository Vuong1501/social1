
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Joi from '../utils/joi/lib';
import CONFIG from '../config';
import validate from '../utils/validate';
// import userController from '../controllers/usersController';
import { verifyPasswordMd5 } from '../utils/crypto';
import { md5 } from '../utils/crypto';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';

/////
import MODELS from '../models/models';
import models from '../entity/index';
const { users } = models;

const router = Router();

// Middleware validate
const validateAuthen = (req, res, next) => {
  const { username, password } = req.body;
  const user = { username, password };
  const SCHEMA = {
    username: Joi.string().min(6).max(100).required(),
    password: Joi.string().required(),
  };

  validate(user, SCHEMA)
    .then(() => next())
    .catch(err => next(new ApiErrors.BaseError({ statusCode: 400, type: 'loginError', error: err, name: 'Login' })));
};

// Đăng nhập hoặc đăng ký
router.post('/', validateAuthen, async (req, res, next) => {
  try {
    const { name, username, password } = req.body;

    console.log("name", name);
    console.log("username", username);
    console.log("password", password);
    let token;
    let dataToken;

    // Tìm thông tin người dùng theo username
    const userInfo = await MODELS.findOne(users, { where: { username: username } }).catch(err => {
      ErrorHelpers.errorThrow(err, 'userNotFoundError', 'Login', 202);
    });


    // console.log("userInfo", userInfo);

    if (!userInfo) {
      // Nếu người dùng chưa tồn tại, tạo tài khoản mới
      const passMd5 = md5(password);
      const newUser = await MODELS.create(users, { name: name, username: username, password: passMd5 });

      // console.log("newUser", newUser);

      dataToken = {
        user: username,
        // userId: newUser.id,
        name: newUser.name,
      };

      token = jwt.sign(dataToken, process.env.JWT_SECRET, { expiresIn: `${CONFIG.TOKEN_LOGIN_EXPIRE}` });
      return res.status(201).json({ success: true, message: 'Đăng ký thành công', token, ...dataToken });
    }

    // Kiểm tra mật khẩu nếu người dùng đã tồn tại
    const passOk = await verifyPasswordMd5(password, userInfo.password);
    if (!passOk) {
      throw new ApiErrors.BaseError({ statusCode: 200, type: 'loginPassError', name: 'Login' });
    }


    // console.log("nameeeee", name);
    // console.log("userInfo.name", userInfo.name);
    // console.log("userInfo.id", userInfo.id);
    // Cập nhật thông tin nếu người dùng thay đổi fullname
    if (name && name !== userInfo.name) {
      await MODELS.update(users, { name: name }, { where: { id: userInfo.id } });
    }

    dataToken = {
      user: username,
      userId: userInfo.id,
      name: userInfo.name,
    };

    token = jwt.sign(dataToken, process.env.JWT_SECRET, { expiresIn: `${CONFIG.TOKEN_LOGIN_EXPIRE}` });

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      ...dataToken,
    });

  } catch (error) {
    next(error);
  }
});

export default router;

