import MODELS from '../models/models';
import models from '../entity/index';
import _, { includes } from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import { Op, where } from 'sequelize';

const { users, friend, sequelize, requestFriend, locationHistories } = models;

export default {
  sendRequestFriend: async (param) => {
    const userReceiveId = param.userReceiveId;
    const userSendId = param.userSendId;
    // không gửi kết bạn cho chính mình
    if (userSendId === userReceiveId) {
      throw new Error('Không gửi kết bạn cho chính mình');
    }

    // const existFriend = await friend.findOne({
    //     where: {
    //         [Op.or]: [
    //             { user1_id: userSendId, user2_id: userReceiveId },
    //             { user1_id: userReceiveId, user2_id: userSendId }
    //         ]
    //     }
    // });

    // if (existFriend) {
    //     throw new Error('Bạn đã là bạn bè, không thể gửi lời mời kết bạn');
    // }

    // xem đã gửi lời mời trước đó chưa
    const existRequest = await requestFriend.findOne({
      where: {
        [Op.or]: [
          { user_send_id: userSendId, user_receive_id: userReceiveId },
          { user_send_id: userReceiveId, user_receive_id: userSendId },
        ],
      },
    });

    if (existRequest) {
      throw new Error('Lời mời kết bạn đã tồn tại');
    }

    //Tạo lời mời kết bạn
    const newRequest = await requestFriend.create({
      user_send_id: userSendId,
      user_receive_id: userReceiveId,
    });
    return newRequest;
  },

  handleRequestFriend: async (param) => {
    const { requestId, status } = param;

    // lấy ra bản ghi yêu cầu kết bạn
    const request = await requestFriend.findOne({
      where: {
        id: requestId,
      },
    });

    if (!request) {
      throw new Error('Lời mời kết bạn không tồn tại');
    }

    // lỗi không xóa requestFriend nếu kết bạn từ trước
    // lặp lại xóa 2 lần
    if (status === 'accept') {
      const { user_send_id, user_receive_id } = request;
      // lưu theo cặp
      const friendPair = [
        { user1_id: user_send_id, user2_id: user_receive_id },
        { user1_id: user_receive_id, user2_id: user_send_id },
      ];
      for (let pair of friendPair) {
        const existingFriendship = await friend.findOne({
          where: {
            user1_id: pair.user1_id,
            user2_id: pair.user2_id,
          },
        });

        if (existingFriendship) {
          console.log(` ${pair.user1_id} và ${pair.user2_id} đã là bạn bè`);
        } else {
          // Thêm cặp bạn bè vào bảng friend
          await friend.create(pair);
          console.log('Service - Friend relationship created:', pair);

          // xóa lời mời kết bạn khỏi bảng requestFriend
          await requestFriend.destroy({
            where: { id: requestId },
          });
        }
      }
    } else if (status === 'reject') {
      // Từ chối kết bạn: Xóa lời mời kết bạn trong bảng `requestFriend`
      await requestFriend.destroy({
        where: { id: requestId },
      });
      console.log('Service - Friend Request rejected and removed.');
    } else {
      throw new Error('Hành động không hợp lệ.');
    }

    return { requestId, status };
  },

  // sửa lại logic getlist
  get_list: async (param) => {
    try {
      // userId not null
      const { sort, range, filter, userId } = param;
      const whereClause = {
        user1_id: userId,
      };

      const whereFriend = {};
      //   if( filter.name){
      //     filter && filter.name
      //     ? {
      //         name: { [Op.like]: `%${filter.name}%` },
      //       }
      //     : undefined,
      //   }

      // console.log("whereClause:", JSON.stringify(whereClause, null, 2));
      const friends = await MODELS.findAndCountAll(friends, {
        where: whereClause,
        include: [
          {
            model: users,
            as: 'user2',
            attributes: ['id', 'name'],
            where: whereFriend,
            include: [
              {
                model: locationHistories,
                as: 'locationHistories',
              },
            ],
          },
        ],
        order: sort,
        limit: range[1] - range[0] + 1,
        offset: range[0],
      });
      console.log('Total friends fetched:', friends.length);

      // console.log("friends:", JSON.stringify(friends, null, 2));

      // Loại bỏ các cặp trùng lặp (dựa trên id)
      //   const uniqueFriendList = Array.from(new Map(friendList.map((friend) => [friend.id, friend])).values());

      return {
        data: friends,
        // count: count,
      };
    } catch (error) {
      console.log('errrrrrrrr', error);
      throw new Error('Error fetching friends: ' + error.message);
    }
  },
};
