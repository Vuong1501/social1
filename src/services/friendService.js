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
    sendRequestFriend: async param => {
        const userReceiveId = param.userReceiveId;
        const userSendId = param.userSendId;
        // không gửi kết bạn cho chính mình
        if (userSendId === userReceiveId) {
            throw new Error('Không gửi kết bạn cho chính mình');
        };

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
                    { user_send_id: userReceiveId, user_receive_id: userSendId }
                ]
            }
        });

        if (existRequest) {
            throw new Error('Lời mời kết bạn đã tồn tại');
        };


        //Tạo lời mời kết bạn
        const newRequest = await requestFriend.create({
            user_send_id: userSendId,
            user_receive_id: userReceiveId,
        })
        return newRequest;
    },

    handleRequestFriend: async param => {
        const { requestId, status } = param;

        // lấy ra bản ghi yêu cầu kết bạn
        const request = await requestFriend.findOne({
            where: {
                id: requestId,
            }
        });

        if (!request) {
            throw new Error("Lời mời kết bạn không tồn tại");
        }

        if (status === 'accept') {
            const { user_send_id, user_receive_id } = request;
            // lưu theo cặp
            const friendPair = [
                { user1_id: user_send_id, user2_id: user_receive_id },
                { user1_id: user_receive_id, user2_id: user_send_id }
            ]
            for (let pair of friendPair) {
                const existingFriendship = await friend.findOne({
                    where: {
                        user1_id: pair.user1_id,
                        user2_id: pair.user2_id
                    }
                });

                if (existingFriendship) {
                    console.log(` ${pair.user1_id} và ${pair.user2_id} đã là bạn bè`);
                } else {
                    // Thêm cặp bạn bè vào bảng friend
                    await friend.create(pair);
                    console.log("Service - Friend relationship created:", pair);

                    // xóa lời mời kết bạn khỏi bảng requestFriend
                    await requestFriend.destroy({
                        where: { id: requestId }
                    })
                }
            }
        } else if (status === 'reject') {
            // Từ chối kết bạn: Xóa lời mời kết bạn trong bảng `requestFriend`
            await requestFriend.destroy({
                where: { id: requestId }
            });
            console.log("Service - Friend Request rejected and removed.");
        } else {
            throw new Error("Hành động không hợp lệ.");
        }


        return { requestId, status };
    },

    get_list: async param => {
        try {

            const { sort, range, filter, userId, attributes } = param;
            // console.log("userId", userId);
            // const userId = param;
            // const whereClause = filter && Object.keys(filter).length
            //     ? {
            //         [Op.and]: [
            //             filter.userId ? { user1_id: filter.userId } : null,
            //             filter.name ? { name: { [Op.like]: `%${filter.name}%` } } : null
            //         ].filter(Boolean) // Loại bỏ giá trị null
            //     }
            //     : {}; // Nếu filter rỗng, lấy tất cả
            const whereClause = {
                [Op.and]: [
                    userId ? { [Op.or]: [{ user1_id: userId }, { user2_id: userId }] } : null,
                    filter && filter.name ? { name: { [Op.like]: `%${filter.name}%` } } : null,
                    { [Op.or]: [{ user1_id: { [Op.ne]: userId } }, { user2_id: { [Op.ne]: userId } }] } // Loại trừ userId
                ].filter(Boolean)
            };

            console.log("whereClause:", JSON.stringify(whereClause, null, 2));
            const friends = await friend.findAll({
                where: whereClause,
                //{
                //     [Op.or]: [
                //         { user1_id: userId },
                //         { user2_id: userId }
                //     ]
                // },
                include: [
                    {
                        model: users,
                        as: 'user1',
                        attributes: ['id', 'name'],
                        include: [
                            {
                                model: locationHistories,
                                as: 'locationHistories',
                                attributes: ['location']
                            }
                        ]
                    },
                    {
                        model: users,
                        as: 'user2',
                        attributes: ['id', 'name'],
                        include: [
                            {
                                model: locationHistories,
                                as: 'locationHistories',
                                attributes: ['location']
                            }
                        ]
                    }
                ],
                order: sort,
                limit: range[1] - range[0] + 1,
                offset: range[0]
            });

            console.log("friends:", JSON.stringify(friends, null, 2));

            // const friendList = friends
            //     .map(friend => {
            //         if (friend.user1_id === userId) {
            //             return {
            //                 id: friend.user2_id,
            //                 name: friend.user2.name,
            //                 locationHistories: friend.user2.locationHistories
            //             };
            //         }
            //         // Kiểm tra nếu userId nằm ở user2_id, lấy user1
            //         if (friend.user2_id === userId) {
            //             return {
            //                 id: friend.user1_id,
            //                 name: friend.user1.name,
            //                 locationHistories: friend.user1.locationHistories
            //             };
            //         }
            //         // Trường hợp không liên quan đến userId
            //         return null;
            //     });

            // console.log("friendList:", JSON.stringify(friendList, null, 2));
            // // console.log("friendList", friendList);

            // // Loại bỏ các cặp trùng lặp (dựa trên id)
            // const uniqueFriendList = Array.from(
            //     new Map(friendList.map(friend => [friend.id, friend])).values()
            // );

            // // console.log("uniqueFriendList:", uniqueFriendList);
            // return uniqueFriendList;
            return friends.map(friend => ({
                id: friend.user1_id === userId ? friend.user2_id : friend.user1_id,
                name: friend.user1_id === userId ? friend.user2.name : friend.user1.name,
                locationHistories: friend.user1_id === userId ? friend.user2.locationHistories : friend.user1.locationHistories
            }));

        } catch (error) {
            console.log("errrrrrrrr", error);
            throw new Error('Error fetching friends: ' + error.message);
        }

        // return new Promise((resolve, reject) => {
        //     // Câu lệnh SQL để lấy danh sách bạn bè của userId
        //     const sqlQuery = `
        //       SELECT 
        //         f.user1_id AS friend_id, 
        //         u1.userName AS friend_userName,
        //         u1.fullName AS friend_fullName
        //       FROM friend f
        //       JOIN users u1 ON f.user1_id = u1.id
        //       WHERE f.user2_id = 1
        //       UNION
        //       SELECT 
        //         f.user2_id AS friend_id, 
        //         u2.userName AS friend_userName,
        //         u2.fullName AS friend_fullName
        //       FROM friend f
        //       JOIN users u2 ON f.user2_id = u2.id
        //       WHERE f.user1_id = 1;
        //     `;

        //     console.log("sqlQuery:", sqlQuery);

        //     // Thực thi câu lệnh SQL với userId được truyền vào
        //     sequelize.query(sqlQuery, {
        //         replacements: { userId },  // Truyền tham số vào câu lệnh SQL
        //     })
        //         .then(friends => {
        //             if (!friends || friends.length === 0) {
        //                 return reject(new ApiErrors.BaseError({
        //                     statusCode: 404,
        //                     type: 'friendsNotFound',
        //                     message: 'No friends found for this user.'
        //                 }));
        //             }
        //             resolve(friends);
        //         })
        //         .catch(error => {
        //             reject(new ApiErrors.BaseError({
        //                 statusCode: 500,
        //                 type: 'serverError',
        //                 message: 'Error fetching friends: ' + error.message
        //             }));
        //         });
        // });
    },

}